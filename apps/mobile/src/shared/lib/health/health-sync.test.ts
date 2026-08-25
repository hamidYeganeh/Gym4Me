const mockReadSamples = jest.fn();
const mockSyncMetrics = jest.fn();
const mockUpsertHealthSyncState = jest.fn();

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

jest.mock("@/shared/lib/api", () => ({
  accountProgress: {
    syncMetrics: mockSyncMetrics,
    upsertHealthSyncState: mockUpsertHealthSyncState,
  },
}));

import {
  authorizedMetricKeysFromAuth,
  flushHealthSamples,
  HEALTH_SYNC_OVERLAP_MS,
  HealthSyncError,
} from "./health-sync";
import type { HealthMetricsAuthorization } from "./health-metrics.types";

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsertHealthSyncState.mockResolvedValue({});
  });

  it("deduplicates and maps only explicitly authorized metrics", () => {
    expect(
      authorizedMetricKeysFromAuth(
        authorization(["steps", "steps", "heartRate"]),
      ),
    ).toEqual(["steps", "heart_rate_bpm"]);
  });

  it("reads only authorized types using an overlap from the successful cursor", async () => {
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
      }),
    );
  });

  it("records a provider error without uploading or advancing sync state", async () => {
    mockReadSamples.mockRejectedValue(new Error("provider offline"));

    await expect(
      flushHealthSamples({
        provider: "apple_health",
        authorization: authorization(["steps"]),
        cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
      }),
    ).rejects.toMatchObject<Partial<HealthSyncError>>({
      code: "health_sync_read_failed",
    });

    expect(mockSyncMetrics).not.toHaveBeenCalled();
    expect(mockUpsertHealthSyncState).toHaveBeenCalledWith("apple_health", {
      status: "error",
      lastErrorCode: "health_sync_read_failed",
    });
  });

  it("does not advance the cursor when any uploaded sample is rejected", async () => {
    mockReadSamples.mockResolvedValue({
      samples: [
        {
          dataType: "steps",
          value: -1,
          unit: "count",
          startDate: "2026-08-24T09:00:00.000Z",
          endDate: "2026-08-24T10:05:00.000Z",
          sourceName: "Watch",
          sourceId: "watch.bundle",
        },
      ],
    });
    mockSyncMetrics.mockResolvedValue({
      accepted: 0,
      created: 0,
      deduplicated: 0,
      rejected: [{ index: 0, reason: "invalid value" }],
    });

    const result = await flushHealthSamples({
      provider: "apple_health",
      authorization: authorization(["steps"]),
      cursorByMetric: { steps: "2026-08-24T10:00:00.000Z" },
    });

    expect(result.rejected).toBe(1);
    expect(mockUpsertHealthSyncState).toHaveBeenLastCalledWith(
      "apple_health",
      {
        status: "partial",
        lastErrorCode: "health_sync_partial_rejection",
      },
    );
  });

  it("advances lastSyncAt after a successful native read with no new samples", async () => {
    mockReadSamples.mockResolvedValue({ samples: [] });

    await flushHealthSamples({
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
        provider: "apple_health",
        authorization: authorization([]),
      }),
    ).rejects.toMatchObject<Partial<HealthSyncError>>({
      code: "health_sync_no_permission",
    });

    expect(mockReadSamples).not.toHaveBeenCalled();
    expect(mockSyncMetrics).not.toHaveBeenCalled();
  });
});
