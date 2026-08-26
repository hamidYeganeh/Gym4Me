const mockReadSamples = jest.fn();
const mockSyncMetrics = jest.fn();
const mockUpsertHealthSyncState = jest.fn();

const queueStored = new Map<string, string>();

jest.mock("./health-metrics", () => ({
  loadHealthPlugin: jest.fn(async () => ({
    Capacitor: { isNativePlatform: () => true },
    Health: {
      isAvailable: async () => ({ available: true, platform: "ios" }),
      readSamples: mockReadSamples,
    },
  })),
  normalizePlatform: (value: string) => value,
}));

jest.mock("./health-sync-queue.storage", () => ({
  healthSyncQueueStorage: {
    loadJson: jest.fn(async (userId: string) => queueStored.get(userId) ?? null),
    saveJson: jest.fn(async (userId: string, value: string) => {
      queueStored.set(userId, value);
    }),
    clearUser: jest.fn(async (userId: string) => {
      queueStored.delete(userId);
    }),
    clearAll: jest.fn(async () => {
      queueStored.clear();
    }),
  },
}));

jest.mock("@/shared/lib/api", () => ({
  accountProgress: {
    syncMetrics: mockSyncMetrics,
    upsertHealthSyncState: mockUpsertHealthSyncState,
  },
}));

import {
  advanceCursorForAcknowledged,
  authorizedMetricKeysFromAuth,
  flushHealthSamples,
  HEALTH_SYNC_OVERLAP_MS,
  HealthSyncError,
} from "./health-sync";
import {
  __resetHealthSyncQueueMemoryForTests,
  clearHealthSyncQueue,
  listHealthSyncQueue,
} from "./health-sync-queue";
import type { HealthMetricsAuthorization } from "./health-metrics.types";

const USER = "athlete-health-sync";

function authorization(
  readAuthorized: HealthMetricsAuthorization["readAuthorized"],
): HealthMetricsAuthorization {
  return {
    readAuthorized,
    readDenied: [],
    writeAuthorized: [],
    writeDenied: [],
  };
}

describe("health sync", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    queueStored.clear();
    __resetHealthSyncQueueMemoryForTests();
    await clearHealthSyncQueue(USER);
    mockUpsertHealthSyncState.mockResolvedValue({});
  });

  it("deduplicates and maps only explicitly authorized metrics", () => {
    expect(
      authorizedMetricKeysFromAuth(
        authorization(["steps", "steps", "heartRate"]),
      ),
    ).toEqual(["steps", "heart_rate_bpm"]);
  });

  it("advances cursor only for acknowledged recordedAt values", () => {
    expect(
      advanceCursorForAcknowledged({
        cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
        acknowledged: [
          { metricKey: "steps", recordedAt: "2026-08-24T10:05:00.000Z" },
          { metricKey: "heart_rate_bpm", recordedAt: "2026-08-24T09:00:00.000Z" },
        ],
      }),
    ).toEqual({
      steps: "2026-08-24T10:05:00.000Z",
      heart_rate_bpm: "2026-08-24T09:00:00.000Z",
    });
  });

  it("queues plugin samples then uploads and advances cursor after ack", async () => {
    mockReadSamples.mockResolvedValue({
      samples: [
        {
          dataType: "steps",
          value: 120,
          unit: "count",
          startDate: "2026-08-24T09:00:00.000Z",
          endDate: "2026-08-24T10:05:00.000Z",
          sourceName: "Watch",
          sourceId: "watch.bundle",
        },
      ],
    });
    mockSyncMetrics.mockResolvedValue({
      accepted: 1,
      created: 1,
      deduplicated: 0,
      rejected: [],
    });

    await flushHealthSamples({
      userId: USER,
      provider: "apple_health",
      authorization: authorization(["steps"]),
      cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
      endDate: "2026-08-24T11:00:00.000Z",
    });

    expect(mockReadSamples).toHaveBeenCalledTimes(1);
    expect(mockReadSamples).toHaveBeenCalledWith(
      expect.objectContaining({
        dataType: "steps",
        startDate: new Date(
          Date.parse("2026-08-24T10:00:00.000Z") - HEALTH_SYNC_OVERLAP_MS,
        ).toISOString(),
      }),
    );
    expect(mockSyncMetrics).toHaveBeenCalledWith({
      entries: [
        expect.objectContaining({
          metricKey: "steps",
          source: "apple_health",
          sourceRecordId:
            "steps|2026-08-24T09:00:00.000Z|2026-08-24T10:05:00.000Z|watch.bundle|120",
          clientMutationId: expect.stringMatching(/^health_/),
        }),
      ],
    });
    expect(mockUpsertHealthSyncState).toHaveBeenLastCalledWith(
      "apple_health",
      expect.objectContaining({
        status: "synced",
        authorizedMetricKeys: ["steps"],
        cursorByMetric: { steps: "2026-08-24T10:05:00.000Z" },
        lastErrorCode: null,
        ops: expect.objectContaining({ kind: "queue_flush", queueDepth: 0 }),
      }),
    );
    expect(await listHealthSyncQueue(USER)).toHaveLength(0);
  });

  it("records a provider error without uploading or advancing sync state", async () => {
    mockReadSamples.mockRejectedValue(new Error("provider offline"));

    await expect(
      flushHealthSamples({
        userId: USER,
        provider: "apple_health",
        authorization: authorization(["steps"]),
        cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
      }),
    ).rejects.toMatchObject<Partial<HealthSyncError>>({
      code: "health_sync_read_failed",
    });

    expect(mockSyncMetrics).not.toHaveBeenCalled();
    expect(mockUpsertHealthSyncState).toHaveBeenCalledWith(
      "apple_health",
      expect.objectContaining({
        status: "error",
        lastErrorCode: "health_sync_read_failed",
      }),
    );
  });

  it("keeps rejected queue items and only advances cursor for acknowledged", async () => {
    mockReadSamples.mockResolvedValue({
      samples: [
        {
          dataType: "steps",
          value: 10,
          unit: "count",
          startDate: "2026-08-24T09:00:00.000Z",
          endDate: "2026-08-24T10:05:00.000Z",
          sourceName: "Watch",
          sourceId: "watch.ok",
        },
        {
          dataType: "steps",
          value: -1,
          unit: "count",
          startDate: "2026-08-24T09:10:00.000Z",
          endDate: "2026-08-24T10:10:00.000Z",
          sourceName: "Watch",
          sourceId: "watch.bad",
        },
      ],
    });
    mockSyncMetrics.mockImplementation(async ({ entries }) => ({
      accepted: 1,
      created: 1,
      deduplicated: 0,
      rejected: [
        {
          index: 1,
          reason: "invalid value",
          clientMutationId: entries[1]?.clientMutationId,
          sourceRecordId: entries[1]?.sourceRecordId,
        },
      ],
    }));

    const result = await flushHealthSamples({
      userId: USER,
      provider: "apple_health",
      authorization: authorization(["steps"]),
      cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
    });

    expect(result.rejected).toBe(1);
    expect(mockUpsertHealthSyncState).toHaveBeenLastCalledWith(
      "apple_health",
      expect.objectContaining({
        status: "partial",
        lastErrorCode: "health_sync_partial_rejection",
        cursorByMetric: { steps: "2026-08-24T10:05:00.000Z" },
      }),
    );
    const remaining = await listHealthSyncQueue(USER);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.status).toBe("rejected_needs_user");
  });

  it("advances lastSyncAt after a successful native read with no new samples", async () => {
    mockReadSamples.mockResolvedValue({ samples: [] });

    await flushHealthSamples({
      userId: USER,
      provider: "apple_health",
      authorization: authorization(["steps"]),
      cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
    });

    expect(mockSyncMetrics).not.toHaveBeenCalled();
    expect(mockUpsertHealthSyncState).toHaveBeenLastCalledWith(
      "apple_health",
      expect.objectContaining({
        status: "synced",
        authorizedMetricKeys: ["steps"],
        cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
        lastSyncAt: expect.any(String),
      }),
    );
  });

  it("refuses to sync when the user granted no read scope", async () => {
    await expect(
      flushHealthSamples({
        userId: USER,
        provider: "apple_health",
        authorization: authorization([]),
      }),
    ).rejects.toMatchObject<Partial<HealthSyncError>>({
      code: "health_sync_no_permission",
    });

    expect(mockReadSamples).not.toHaveBeenCalled();
    expect(mockSyncMetrics).not.toHaveBeenCalled();
  });

  it("keeps samples in the queue when upload fails so reconnect can flush", async () => {
    mockReadSamples.mockResolvedValue({
      samples: [
        {
          dataType: "steps",
          value: 50,
          unit: "count",
          startDate: "2026-08-24T09:00:00.000Z",
          endDate: "2026-08-24T10:00:00.000Z",
          sourceName: "Watch",
          sourceId: "watch.offline",
        },
      ],
    });
    mockSyncMetrics.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await flushHealthSamples({
      userId: USER,
      provider: "apple_health",
      authorization: authorization(["steps"]),
    });

    expect(result.queue.pending + result.queue.retryable + result.queue.poison).toBeGreaterThan(
      0,
    );
    expect(await listHealthSyncQueue(USER)).toHaveLength(1);
    expect(mockUpsertHealthSyncState).toHaveBeenLastCalledWith(
      "apple_health",
      expect.objectContaining({
        status: "error",
        lastErrorCode: "health_sync_queue_pending",
      }),
    );
  });
});
