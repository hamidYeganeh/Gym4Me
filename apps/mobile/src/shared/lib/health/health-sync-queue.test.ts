const stored = new Map<string, string>();

jest.mock("./health-sync-queue.storage", () => ({
  healthSyncQueueStorage: {
    loadJson: jest.fn(async (userId: string) => stored.get(userId) ?? null),
    saveJson: jest.fn(async (userId: string, value: string) => {
      stored.set(userId, value);
    }),
    clearUser: jest.fn(async (userId: string) => {
      stored.delete(userId);
    }),
    clearAll: jest.fn(async () => {
      stored.clear();
    }),
  },
}));

const api = {
  syncMetrics: jest.fn(),
};

jest.mock("@/shared/lib/api", () => ({ accountProgress: api }));

import {
  __resetHealthSyncQueueMemoryForTests,
  clearHealthSyncQueue,
  enqueueHealthSyncSamples,
  flushHealthSyncQueue,
  healthSampleFingerprint,
  listHealthSyncQueue,
  purgeHealthSyncQueue,
  retryPoisonHealthSyncItems,
  HEALTH_SYNC_QUEUE_MAX_ATTEMPTS,
} from "./health-sync-queue";

const USER = "athlete-user-1";

describe("health sync offline queue", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    stored.clear();
    __resetHealthSyncQueueMemoryForTests();
    await clearHealthSyncQueue(USER);
  });

  it("dedupes by fingerprint and source record id", async () => {
    const entry = {
      metricKey: "steps",
      value: 100,
      unit: "steps",
      recordedAt: "2026-08-26T20:30:00.000Z",
      source: "apple_health" as const,
      sourceRecordId: "steps|a|b|watch|100",
    };

    const first = await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [entry],
    });
    const second = await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [entry],
    });

    expect(first.enqueued).toBe(1);
    expect(second.skippedDuplicate).toBe(1);
    expect(await listHealthSyncQueue(USER)).toHaveLength(1);
    expect(
      healthSampleFingerprint({
        provider: "apple_health",
        metricKey: entry.metricKey,
        sourceRecordId: entry.sourceRecordId,
        recordedAt: entry.recordedAt,
        value: entry.value,
        unit: entry.unit,
      }),
    ).toMatch(/^fnv1a_/);
  });

  it("reconciles partial batches: keeps rejected, drops acknowledged", async () => {
    await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [
        {
          metricKey: "steps",
          value: 10,
          recordedAt: "2026-08-26T20:30:00.000Z",
          source: "apple_health",
          sourceRecordId: "ok-1",
          clientMutationId: "health_ok",
        },
        {
          metricKey: "steps",
          value: -1,
          recordedAt: "2026-08-26T20:31:00.000Z",
          source: "apple_health",
          sourceRecordId: "bad-1",
          clientMutationId: "health_bad",
        },
      ],
    });

    api.syncMetrics.mockResolvedValue({
      accepted: 1,
      created: 1,
      deduplicated: 0,
      rejected: [
        {
          index: 1,
          reason: "health_sync_metric_scope_not_authorized",
          clientMutationId: "health_bad",
          sourceRecordId: "bad-1",
        },
      ],
    });

    const flush = await flushHealthSyncQueue({
      userId: USER,
      provider: "apple_health",
    });

    expect(flush.acknowledged).toHaveLength(1);
    expect(flush.acknowledged[0]?.sourceRecordId).toBe("ok-1");
    const remaining = await listHealthSyncQueue(USER);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.status).toBe("rejected_needs_user");
    expect(remaining[0]?.sourceRecordId).toBe("bad-1");
  });

  it("shares one in-flight flush so concurrent callers do not double-send", async () => {
    await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [
        {
          metricKey: "steps",
          value: 5,
          recordedAt: "2026-08-26T21:00:00.000Z",
          source: "apple_health",
          sourceRecordId: "once-1",
        },
      ],
    });

    let release!: (value: unknown) => void;
    api.syncMetrics.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );

    const first = flushHealthSyncQueue({ userId: USER, provider: "apple_health" });
    const second = flushHealthSyncQueue({ userId: USER, provider: "apple_health" });

    await new Promise<void>((resolve) => {
      const check = () => {
        if (api.syncMetrics.mock.calls.length > 0) {
          resolve();
          return;
        }
        setTimeout(check, 0);
      };
      check();
    });
    expect(api.syncMetrics).toHaveBeenCalledTimes(1);
    release({
      accepted: 1,
      created: 1,
      deduplicated: 0,
      rejected: [],
    });
    await Promise.all([first, second]);
    expect(api.syncMetrics).toHaveBeenCalledTimes(1);
  });

  it("purges unsent items on provider disconnect and scope revoke", async () => {
    await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [
        {
          metricKey: "steps",
          value: 1,
          recordedAt: "2026-08-26T18:00:00.000Z",
          source: "apple_health",
          sourceRecordId: "steps-1",
        },
        {
          metricKey: "heart_rate_bpm",
          value: 70,
          recordedAt: "2026-08-26T18:01:00.000Z",
          source: "apple_health",
          sourceRecordId: "hr-1",
        },
      ],
    });

    const scopePurged = await purgeHealthSyncQueue({
      userId: USER,
      provider: "apple_health",
      keepMetricKeys: ["steps"],
    });
    expect(scopePurged).toBe(1);
    expect((await listHealthSyncQueue(USER)).map((item) => item.metricKey)).toEqual([
      "steps",
    ]);

    const disconnected = await purgeHealthSyncQueue({
      userId: USER,
      provider: "apple_health",
    });
    expect(disconnected).toBe(1);
    expect(await listHealthSyncQueue(USER)).toHaveLength(0);
  });

  it("marks network failures retryable then poison after max attempts", async () => {
    await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [
        {
          metricKey: "steps",
          value: 2,
          recordedAt: "2026-08-26T22:00:00.000Z",
          source: "apple_health",
          sourceRecordId: "net-1",
        },
      ],
    });

    api.syncMetrics.mockRejectedValue(new TypeError("Failed to fetch"));

    for (let i = 0; i < HEALTH_SYNC_QUEUE_MAX_ATTEMPTS - 1; i += 1) {
      const items = await listHealthSyncQueue(USER);
      const item = items[0];
      if (!item) throw new Error("missing queue item");
      // Force due now ignoring backoff for test.
      stored.set(
        USER,
        JSON.stringify([
          {
            ...item,
            status: "queued",
            nextRetryAt: null,
            attempts: i,
          },
        ]),
      );
      __resetHealthSyncQueueMemoryForTests();
      await flushHealthSyncQueue({ userId: USER, provider: "apple_health" });
    }

    stored.set(
      USER,
      JSON.stringify([
        {
          ...(await listHealthSyncQueue(USER))[0],
          status: "queued",
          nextRetryAt: null,
          attempts: HEALTH_SYNC_QUEUE_MAX_ATTEMPTS - 1,
        },
      ]),
    );
    __resetHealthSyncQueueMemoryForTests();
    await flushHealthSyncQueue({ userId: USER, provider: "apple_health" });

    const poisoned = await listHealthSyncQueue(USER);
    expect(poisoned[0]?.status).toBe("poison");

    const recovered = await retryPoisonHealthSyncItems({ userId: USER });
    expect(recovered).toBe(1);
    expect((await listHealthSyncQueue(USER))[0]?.status).toBe("queued");
  });

  it("recovers corrupted storage without throwing", async () => {
    stored.set(USER, "{not-json");
    __resetHealthSyncQueueMemoryForTests();
    expect(await listHealthSyncQueue(USER)).toEqual([]);
  });

  it("keeps Tehran/UTC recordedAt ordering stable for cursor candidates", async () => {
    // 2026-08-26 00:30 Asia/Tehran == 2026-08-25 21:00 UTC
    const tehranLocalAsUtc = "2026-08-25T21:00:00.000Z";
    const laterUtc = "2026-08-26T01:00:00.000Z";
    await enqueueHealthSyncSamples({
      userId: USER,
      provider: "apple_health",
      entries: [
        {
          metricKey: "steps",
          value: 1,
          recordedAt: laterUtc,
          source: "apple_health",
          sourceRecordId: "later",
        },
        {
          metricKey: "steps",
          value: 1,
          recordedAt: tehranLocalAsUtc,
          source: "apple_health",
          sourceRecordId: "earlier-tehran",
        },
      ],
    });
    const items = await listHealthSyncQueue(USER);
    const ordered = items
      .map((item) => item.payload.recordedAt)
      .sort((a, b) => Date.parse(a) - Date.parse(b));
    expect(ordered).toEqual([tehranLocalAsUtc, laterUtc]);
    expect(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(tehranLocalAsUtc)),
    ).toBe("2026-08-26");
  });
});
