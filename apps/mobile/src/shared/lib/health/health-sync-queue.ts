import type {
  HealthSyncProvider,
  SyncProgressMetricInput,
  SyncProgressMetricsResult,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { accountProgress } from "@/shared/lib/api";
import { healthSyncQueueStorage } from "./health-sync-queue.storage";
import type {
  HealthSyncQueueFlushResult,
  HealthSyncQueueItem,
  HealthSyncQueueItemStatus,
  HealthSyncQueuePayload,
  HealthSyncQueueSummary,
} from "./health-sync-queue.types";

export const HEALTH_SYNC_QUEUE_MAX_ITEMS = 500;
export const HEALTH_SYNC_QUEUE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
export const HEALTH_SYNC_QUEUE_MAX_ATTEMPTS = 8;
export const HEALTH_SYNC_QUEUE_BATCH_SIZE = 50;
export const HEALTH_SYNC_QUEUE_BASE_BACKOFF_MS = 2_000;
export const HEALTH_SYNC_QUEUE_MAX_BACKOFF_MS = 15 * 60 * 1000;

const PENDING_STATUSES: HealthSyncQueueItemStatus[] = [
  "queued",
  "sending",
  "retryable_error",
];

type FlushOutcome = HealthSyncQueueFlushResult & {
  acknowledged: HealthSyncQueueItem[];
};

const memoryByUser = new Map<string, HealthSyncQueueItem[]>();
const flushPromises = new Map<string, Promise<FlushOutcome>>();

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `hsq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createHealthClientMutationId() {
  return `health_${newId()}`;
}

/** Compact fingerprint for dedupe — never logged as a health value. */
export function healthSampleFingerprint(input: {
  provider: HealthSyncProvider;
  metricKey: string;
  sourceRecordId: string;
  recordedAt: string;
  value: number;
  unit?: string;
}): string {
  const raw = [
    input.provider,
    input.metricKey,
    input.sourceRecordId,
    input.recordedAt,
    String(input.value),
    input.unit ?? "",
  ].join("|");
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}`;
}

export function isHealthSyncNetworkFailure(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  if (error instanceof TypeError) return true;
  if (error instanceof ApiError) {
    return error.status >= 500 || error.status === 0;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("offline")
    );
  }
  return false;
}

function computeNextRetryAt(attempts: number, now = Date.now()): string {
  const exp = Math.min(
    HEALTH_SYNC_QUEUE_MAX_BACKOFF_MS,
    HEALTH_SYNC_QUEUE_BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1),
  );
  const jitter = Math.floor(Math.random() * Math.max(250, exp * 0.2));
  return new Date(now + exp + jitter).toISOString();
}

function touch(
  item: HealthSyncQueueItem,
  patch: Partial<HealthSyncQueueItem>,
): HealthSyncQueueItem {
  return {
    ...item,
    ...patch,
    updatedAt: nowIso(),
  };
}

function recoverCrashInFlight(items: HealthSyncQueueItem[]): HealthSyncQueueItem[] {
  return items.map((item) =>
    item.status === "sending"
      ? touch(item, {
          status: "queued",
          nextRetryAt: null,
          lastError: "health_sync_queue_interrupted",
        })
      : item,
  );
}

function pruneTerminal(items: HealthSyncQueueItem[]): HealthSyncQueueItem[] {
  return items.filter((item) => item.status !== "synced");
}

function enforceBounds(
  items: HealthSyncQueueItem[],
  now = Date.now(),
): HealthSyncQueueItem[] {
  const ageCut = now - HEALTH_SYNC_QUEUE_MAX_AGE_MS;
  let next = items.map((item) => {
    if (
      PENDING_STATUSES.includes(item.status) &&
      Date.parse(item.createdAt) < ageCut
    ) {
      return touch(item, {
        status: "poison",
        lastError: "health_sync_queue_item_expired",
        nextRetryAt: null,
      });
    }
    return item;
  });

  const pending = next.filter((item) => PENDING_STATUSES.includes(item.status));
  if (pending.length > HEALTH_SYNC_QUEUE_MAX_ITEMS) {
    const overflow = pending
      .slice()
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(0, pending.length - HEALTH_SYNC_QUEUE_MAX_ITEMS)
      .map((item) => item.id);
    const overflowIds = new Set(overflow);
    next = next.map((item) =>
      overflowIds.has(item.id)
        ? touch(item, {
            status: "poison",
            lastError: "health_sync_queue_capacity_exceeded",
            nextRetryAt: null,
          })
        : item,
    );
  }
  return next;
}

async function loadAll(userId: string): Promise<HealthSyncQueueItem[]> {
  const cached = memoryByUser.get(userId);
  if (cached) return cached;

  const raw = await healthSyncQueueStorage.loadJson(userId);
  if (!raw) {
    memoryByUser.set(userId, []);
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as HealthSyncQueueItem[];
    const items = recoverCrashInFlight(
      Array.isArray(parsed) ? parsed.filter((item) => item.userId === userId) : [],
    );
    memoryByUser.set(userId, items);
    return items;
  } catch {
    // Corrupted storage: quarantine by clearing and reporting empty queue.
    await healthSyncQueueStorage.clearUser(userId);
    memoryByUser.set(userId, []);
    return [];
  }
}

async function persist(
  userId: string,
  items: HealthSyncQueueItem[],
): Promise<void> {
  const next = pruneTerminal(enforceBounds(items));
  memoryByUser.set(userId, next);
  await healthSyncQueueStorage.saveJson(userId, JSON.stringify(next));
}

export async function listHealthSyncQueue(
  userId: string,
): Promise<HealthSyncQueueItem[]> {
  return loadAll(userId);
}

export async function summarizeHealthSyncQueue(
  userId: string,
): Promise<HealthSyncQueueSummary> {
  const items = await loadAll(userId);
  const pendingItems = items.filter((item) =>
    PENDING_STATUSES.includes(item.status),
  );
  return {
    pending: pendingItems.length,
    retryable: items.filter((item) => item.status === "retryable_error").length,
    poison: items.filter((item) => item.status === "poison").length,
    rejected: items.filter((item) => item.status === "rejected_needs_user")
      .length,
    oldestPendingAt:
      pendingItems
        .map((item) => item.createdAt)
        .sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null,
  };
}

export async function enqueueHealthSyncSamples(options: {
  userId: string;
  provider: HealthSyncProvider;
  entries: SyncProgressMetricInput[];
}): Promise<{ enqueued: number; skippedDuplicate: number }> {
  const items = await loadAll(options.userId);
  let enqueued = 0;
  let skippedDuplicate = 0;
  const next = [...items];

  for (const entry of options.entries) {
    if (entry.source !== options.provider) continue;
    const sourceRecordId = entry.sourceRecordId?.trim();
    if (!sourceRecordId) continue;

    const fingerprint = healthSampleFingerprint({
      provider: options.provider,
      metricKey: entry.metricKey,
      sourceRecordId,
      recordedAt: entry.recordedAt,
      value: entry.value,
      unit: entry.unit,
    });

    const duplicate = next.find(
      (item) =>
        item.provider === options.provider &&
        (item.payloadFingerprint === fingerprint ||
          (item.sourceRecordId === sourceRecordId &&
            item.metricKey === entry.metricKey)) &&
        item.status !== "synced" &&
        item.status !== "rejected_needs_user",
    );
    if (duplicate) {
      skippedDuplicate += 1;
      continue;
    }

    const clientMutationId =
      entry.clientMutationId?.trim() || createHealthClientMutationId();
    const payload: HealthSyncQueuePayload = {
      ...entry,
      source: options.provider,
      sourceRecordId,
      clientMutationId,
      privacy: entry.privacy ?? "private",
    };
    next.push({
      id: newId(),
      userId: options.userId,
      provider: options.provider,
      metricKey: entry.metricKey,
      sourceRecordId,
      payloadFingerprint: fingerprint,
      clientMutationId,
      status: "queued",
      payload,
      attempts: 0,
      nextRetryAt: null,
      lastError: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    enqueued += 1;
  }

  await persist(options.userId, next);
  return { enqueued, skippedDuplicate };
}

export async function purgeHealthSyncQueue(options: {
  userId: string;
  provider?: HealthSyncProvider;
  /** When set with provider, keep only these metric keys (revoke others). */
  keepMetricKeys?: string[];
}): Promise<number> {
  const items = await loadAll(options.userId);
  const before = items.length;
  const keepSet =
    options.keepMetricKeys && options.keepMetricKeys.length > 0
      ? new Set(options.keepMetricKeys)
      : null;

  const filtered = items.filter((item) => {
    if (options.provider && item.provider !== options.provider) return true;
    if (options.provider && keepSet) {
      return keepSet.has(item.metricKey);
    }
    if (options.provider && !keepSet) {
      return false;
    }
    if (!options.provider && keepSet) {
      return keepSet.has(item.metricKey);
    }
    return false;
  });

  const purged = before - filtered.length;
  await persist(options.userId, filtered);
  return purged;
}

export async function retryPoisonHealthSyncItems(options: {
  userId: string;
  itemIds?: string[];
}): Promise<number> {
  const items = await loadAll(options.userId);
  const idSet = options.itemIds ? new Set(options.itemIds) : null;
  let count = 0;
  const next = items.map((item) => {
    if (item.status !== "poison" && item.status !== "rejected_needs_user") {
      return item;
    }
    if (idSet && !idSet.has(item.id)) return item;
    count += 1;
    return touch(item, {
      status: "queued",
      attempts: 0,
      nextRetryAt: null,
      lastError: null,
    });
  });
  await persist(options.userId, next);
  return count;
}

export async function discardHealthSyncQueueItems(options: {
  userId: string;
  itemIds: string[];
}): Promise<number> {
  const idSet = new Set(options.itemIds);
  const items = await loadAll(options.userId);
  const next = items.filter((item) => !idSet.has(item.id));
  const removed = items.length - next.length;
  await persist(options.userId, next);
  return removed;
}

export async function clearHealthSyncQueue(userId: string): Promise<void> {
  memoryByUser.delete(userId);
  await healthSyncQueueStorage.clearUser(userId);
}

export async function clearAllHealthSyncQueues(): Promise<void> {
  memoryByUser.clear();
  await healthSyncQueueStorage.clearAll();
}

function applySyncResult(
  items: HealthSyncQueueItem[],
  batch: HealthSyncQueueItem[],
  result: SyncProgressMetricsResult,
): {
  items: HealthSyncQueueItem[];
  acknowledged: HealthSyncQueueItem[];
  rejectedReasons: string[];
} {
  const rejectedByMutation = new Map(
    result.rejected
      .map((entry) => {
        const mutationId =
          entry.clientMutationId ??
          batch[entry.index]?.payload.clientMutationId;
        return mutationId
          ? ([mutationId, entry.reason] as const)
          : null;
      })
      .filter((entry): entry is readonly [string, string] => entry != null),
  );
  const rejectedBySource = new Map(
    result.rejected
      .map((entry) => {
        const sourceRecordId =
          entry.sourceRecordId ?? batch[entry.index]?.sourceRecordId;
        return sourceRecordId
          ? ([sourceRecordId, entry.reason] as const)
          : null;
      })
      .filter((entry): entry is readonly [string, string] => entry != null),
  );

  const batchIds = new Set(batch.map((item) => item.id));
  const acknowledged: HealthSyncQueueItem[] = [];
  const rejectedReasons: string[] = [];

  const next = items.map((item) => {
    if (!batchIds.has(item.id)) return item;
    const reason =
      rejectedByMutation.get(item.clientMutationId) ??
      rejectedBySource.get(item.sourceRecordId);
    if (reason) {
      rejectedReasons.push(reason);
      return touch(item, {
        status: "rejected_needs_user",
        lastError: reason,
        nextRetryAt: null,
        attempts: item.attempts + 1,
      });
    }
    acknowledged.push(item);
    return touch(item, {
      status: "synced",
      lastError: null,
      nextRetryAt: null,
    });
  });

  return { items: next, acknowledged, rejectedReasons };
}

/**
 * Ordered, single-flight flush. Cursor advancement is the caller's job using
 * returned acknowledged payloads.
 */
export async function flushHealthSyncQueue(options: {
  userId: string;
  provider?: HealthSyncProvider;
  now?: number;
}): Promise<
  HealthSyncQueueFlushResult & { acknowledged: HealthSyncQueueItem[] }
> {
  const existing = flushPromises.get(options.userId);
  if (existing) return existing;

  const startedAt = options.now ?? Date.now();
  const promise = (async (): Promise<
    HealthSyncQueueFlushResult & { acknowledged: HealthSyncQueueItem[] }
  > => {
    let working = await loadAll(options.userId);
    const due = working
      .filter((item) => {
        if (!PENDING_STATUSES.includes(item.status)) return false;
        if (options.provider && item.provider !== options.provider) return false;
        if (item.nextRetryAt && Date.parse(item.nextRetryAt) > startedAt) {
          return false;
        }
        return true;
      })
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(0, HEALTH_SYNC_QUEUE_BATCH_SIZE);

    if (due.length === 0) {
      const summary = await summarizeHealthSyncQueue(options.userId);
      return {
        synced: 0,
        deduplicatedHint: 0,
        retryable: summary.retryable,
        rejected: summary.rejected,
        poison: summary.poison,
        remaining: summary.pending,
        latencyMs: Date.now() - startedAt,
        rejectedReasons: [],
        acknowledged: [],
      };
    }

    working = working.map((item) =>
      due.some((candidate) => candidate.id === item.id)
        ? touch(item, { status: "sending" })
        : item,
    );
    await persist(options.userId, working);

    const batch = working.filter((item) =>
      due.some((candidate) => candidate.id === item.id),
    );

    let acknowledged: HealthSyncQueueItem[] = [];
    let rejectedReasons: string[] = [];
    let synced = 0;
    let deduplicatedHint = 0;

    try {
      const result = await accountProgress.syncMetrics({
        entries: batch.map((item) => item.payload),
      });
      const applied = applySyncResult(working, batch, result);
      working = applied.items;
      acknowledged = applied.acknowledged;
      rejectedReasons = [...new Set(applied.rejectedReasons)];
      synced = result.created;
      deduplicatedHint = result.deduplicated;
      await persist(options.userId, working);
    } catch (error) {
      const network = isHealthSyncNetworkFailure(error);
      const message = error instanceof Error ? error.message : "sync failed";
      working = working.map((item) => {
        if (!due.some((candidate) => candidate.id === item.id)) return item;
        const attempts = item.attempts + 1;
        if (!network || attempts >= HEALTH_SYNC_QUEUE_MAX_ATTEMPTS) {
          return touch(item, {
            status: "poison",
            attempts,
            lastError: network
              ? "health_sync_queue_max_retries"
              : message,
            nextRetryAt: null,
          });
        }
        return touch(item, {
          status: "retryable_error",
          attempts,
          lastError: message,
          nextRetryAt: computeNextRetryAt(attempts, startedAt),
        });
      });
      await persist(options.userId, working);
    }

    const after = await summarizeHealthSyncQueue(options.userId);
    return {
      synced,
      deduplicatedHint,
      retryable: after.retryable,
      rejected: after.rejected,
      poison: after.poison,
      remaining: after.pending,
      latencyMs: Date.now() - startedAt,
      rejectedReasons,
      acknowledged,
    };
  })().finally(() => {
    flushPromises.delete(options.userId);
  });

  flushPromises.set(options.userId, promise);
  return promise;
}

/** Test helper: reset in-memory state between unit tests. */
export function __resetHealthSyncQueueMemoryForTests() {
  memoryByUser.clear();
  flushPromises.clear();
}
