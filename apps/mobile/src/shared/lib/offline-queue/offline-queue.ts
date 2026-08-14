import { ApiError, type SyncProgressMetricsResult } from "@repo/api";
import { accountProgress } from "@/shared/lib/api";
import { offlineQueueStorage } from "./offline-queue.storage";
import type {
  OfflineMetricPayload,
  OfflineQueueFlushResult,
  OfflineQueueItem,
  OfflineQueueItemStatus,
} from "./offline-queue.types";

const PENDING_STATUSES: OfflineQueueItemStatus[] = [
  "queued",
  "sending",
  "retryable_error",
];

let memory: OfflineQueueItem[] | null = null;
let flushPromise: Promise<OfflineQueueFlushResult> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `oq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createClientMutationId(prefix = "metric") {
  return `${prefix}_${newId()}`;
}

export function isNetworkFailure(error: unknown): boolean {
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

async function loadAll(): Promise<OfflineQueueItem[]> {
  if (memory) return memory;
  const raw = await offlineQueueStorage.loadJson();
  if (!raw) {
    memory = [];
    return memory;
  }
  try {
    const parsed = JSON.parse(raw) as OfflineQueueItem[];
    memory = Array.isArray(parsed) ? parsed : [];
  } catch {
    memory = [];
  }
  return memory;
}

async function persist(items: OfflineQueueItem[]): Promise<void> {
  memory = items;
  await offlineQueueStorage.saveJson(JSON.stringify(items));
}

function touch(
  item: OfflineQueueItem,
  patch: Partial<OfflineQueueItem>,
): OfflineQueueItem {
  return {
    ...item,
    ...patch,
    updatedAt: nowIso(),
  };
}

/** Enqueue a metric payload (must include clientMutationId). */
export async function enqueue(
  payload: OfflineMetricPayload,
): Promise<OfflineQueueItem> {
  const items = await loadAll();
  const existing = items.find(
    (item) =>
      item.kind === "metric" &&
      item.payload.clientMutationId === payload.clientMutationId &&
      item.status !== "synced" &&
      item.status !== "rejected_needs_user",
  );
  if (existing) return existing;

  const created: OfflineQueueItem = {
    id: newId(),
    kind: "metric",
    status: "queued",
    payload: {
      ...payload,
      source: payload.source ?? "manual",
      privacy: payload.privacy ?? "private",
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attempts: 0,
    lastError: null,
  };
  await persist([created, ...items]);
  return created;
}

export async function listPending(): Promise<OfflineQueueItem[]> {
  const items = await loadAll();
  return items.filter((item) => PENDING_STATUSES.includes(item.status));
}

export async function listAll(): Promise<OfflineQueueItem[]> {
  return loadAll();
}

export async function clearOfflineQueue(): Promise<void> {
  memory = [];
  await offlineQueueStorage.clear();
}

function applySyncResult(
  items: OfflineQueueItem[],
  batch: OfflineQueueItem[],
  result: SyncProgressMetricsResult,
): OfflineQueueItem[] {
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

  const batchIds = new Set(batch.map((item) => item.id));

  return items.map((item) => {
    if (!batchIds.has(item.id)) return item;
    const reason = rejectedByMutation.get(item.payload.clientMutationId);
    if (reason) {
      return touch(item, {
        status: "rejected_needs_user",
        lastError: reason,
      });
    }
    return touch(item, {
      status: "synced",
      lastError: null,
    });
  });
}

/**
 * Flush pending metric items via `accountProgress.syncMetrics`.
 * Concurrent callers share one in-flight flush.
 */
export async function flush(): Promise<OfflineQueueFlushResult> {
  if (flushPromise) return flushPromise;

  flushPromise = (async (): Promise<OfflineQueueFlushResult> => {
    const items = await loadAll();
    const pending = items.filter((item) =>
      PENDING_STATUSES.includes(item.status),
    );
    if (pending.length === 0) {
      return { synced: 0, retryable: 0, rejected: 0 };
    }

    let working = items.map((item) =>
      PENDING_STATUSES.includes(item.status)
        ? touch(item, { status: "sending" })
        : item,
    );
    await persist(working);

    const batch = working.filter((item) => item.status === "sending");

    try {
      const result = await accountProgress.syncMetrics({
        entries: batch.map((item) => item.payload),
      });
      working = applySyncResult(working, batch, result);
      await persist(working);
    } catch (error) {
      const network = isNetworkFailure(error);
      const message =
        error instanceof Error ? error.message : "sync failed";
      working = working.map((item) => {
        if (item.status !== "sending") return item;
        return touch(item, {
          status: network ? "retryable_error" : "rejected_needs_user",
          attempts: item.attempts + 1,
          lastError: message,
        });
      });
      await persist(working);
    }

    const after = await loadAll();
    return {
      synced: after.filter((item) => item.status === "synced").length,
      retryable: after.filter((item) => item.status === "retryable_error")
        .length,
      rejected: after.filter((item) => item.status === "rejected_needs_user")
        .length,
    };
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
}
