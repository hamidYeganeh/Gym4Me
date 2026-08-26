import type {
  OfflineCheckInItemInput,
  OfflineCheckinReconciliation,
  OfflineCheckinSnapshot,
} from "@repo/api/checkin";
import { ApiError } from "@repo/api/client";
import { accountCheckin } from "@/shared/lib/api";
import { getNativeSecureStore } from "@/shared/lib/native-secure-store";
import { buildOfflineCheckinSyncOps } from "./offline-checkin-telemetry";

type QueuedCheckin = OfflineCheckInItemInput & {
  status: "pending" | "review" | "rejected";
  error?: string;
};

type OfflineCheckinState = {
  deviceId: string;
  snapshotToken: string;
  snapshot: OfflineCheckinSnapshot;
  queue: QueuedCheckin[];
  nextSequence: number;
};

export type OfflineCheckinQueueSummary = {
  queueDepth: number;
  pendingCount: number;
  reviewCount: number;
  rejectedCount: number;
  snapshotExpired: boolean;
  syncDeadlinePassed: boolean;
  needsRecovery: boolean;
  recoveryReason: "corrupt_state" | "stale_snapshot" | "revoked_device" | null;
};

const key = (clubId: string, userId: string) =>
  `gym4me.owner.checkin.${clubId}.${userId}`;
const INDEX_KEY = "gym4me.owner.checkin.index";

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

async function load(clubId: string, userId: string) {
  const store = await getNativeSecureStore();
  if (!store.isNative) return null;
  const raw = await store.getItem(key(clubId, userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OfflineCheckinState;
  } catch {
    await store.removeItem(key(clubId, userId));
    return { corrupt: true as const };
  }
}

async function persist(
  clubId: string,
  userId: string,
  state: OfflineCheckinState,
) {
  const store = await getNativeSecureStore();
  if (!store.isNative) return;
  const stateKey = key(clubId, userId);
  await store.setItem(stateKey, JSON.stringify(state));
  const rawIndex = await store.getItem(INDEX_KEY);
  let index: string[] = [];
  try {
    index = rawIndex ? (JSON.parse(rawIndex) as string[]) : [];
  } catch {
    index = [];
  }
  if (!index.includes(stateKey)) {
    await store.setItem(INDEX_KEY, JSON.stringify([...index, stateKey]));
  }
}

function isStaleSnapshot(snapshot: OfflineCheckinSnapshot, now = Date.now()) {
  return (
    new Date(snapshot.expiresAt).getTime() <= now ||
    new Date(snapshot.syncDeadline).getTime() <= now
  );
}

export async function getOfflineCheckinQueueSummary(
  clubId: string,
  userId: string,
): Promise<OfflineCheckinQueueSummary | null> {
  const loaded = await load(clubId, userId);
  if (!loaded) {
    return null;
  }
  if ("corrupt" in loaded) {
    return {
      queueDepth: 0,
      pendingCount: 0,
      reviewCount: 0,
      rejectedCount: 0,
      snapshotExpired: false,
      syncDeadlinePassed: false,
      needsRecovery: true,
      recoveryReason: "corrupt_state",
    };
  }
  const now = Date.now();
  const snapshotExpired = new Date(loaded.snapshot.expiresAt).getTime() <= now;
  const syncDeadlinePassed =
    new Date(loaded.snapshot.syncDeadline).getTime() <= now;
  const pendingCount = loaded.queue.filter((item) => item.status === "pending").length;
  const reviewCount = loaded.queue.filter((item) => item.status === "review").length;
  const rejectedCount = loaded.queue.filter(
    (item) => item.status === "rejected",
  ).length;
  const needsRecovery =
    snapshotExpired ||
    syncDeadlinePassed ||
    (pendingCount > 0 && (snapshotExpired || syncDeadlinePassed));
  return {
    queueDepth: loaded.queue.length,
    pendingCount,
    reviewCount,
    rejectedCount,
    snapshotExpired,
    syncDeadlinePassed,
    needsRecovery,
    recoveryReason: needsRecovery ? "stale_snapshot" : null,
  };
}

export async function resetOfflineCheckinState(clubId: string, userId: string) {
  const store = await getNativeSecureStore();
  if (!store.isNative) return;
  await store.removeItem(key(clubId, userId));
}

export async function prepareOfflineCheckin(
  clubId: string,
  userId: string,
): Promise<OfflineCheckinState | null> {
  const store = await getNativeSecureStore();
  if (!store.isNative) return null;
  const loaded = await load(clubId, userId);
  if (loaded && "corrupt" in loaded) {
    return null;
  }
  const current = loaded && !("corrupt" in loaded) ? loaded : null;
  if (current && current.queue.length > 0) {
    return current;
  }
  if (
    current &&
    new Date(current.snapshot.expiresAt).getTime() > Date.now() + 60_000 &&
    new Date(current.snapshot.syncDeadline).getTime() > Date.now()
  ) {
    return current;
  }

  let deviceId = current?.deviceId;
  if (!deviceId) {
    const namePrefix = `capacitor-${userId.slice(-10)}`;
    const devices = await accountCheckin.listDevices(clubId);
    deviceId = devices.result.find(
      (device) =>
        device.name.startsWith(namePrefix) &&
        device.provider === "capacitor" &&
        device.status === "active",
    )?.id;
    if (!deviceId) {
      const provisioned = await accountCheckin.provisionDevice(clubId, {
        name: `${namePrefix}-${Date.now().toString(36)}`,
        provider: "capacitor",
      });
      deviceId = provisioned.device.id;
    }
  }

  let issued;
  try {
    issued = await accountCheckin.issueOfflineSnapshot(clubId, deviceId);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
    const provisioned = await accountCheckin.provisionDevice(clubId, {
      name: `capacitor-${userId.slice(-10)}-${Date.now().toString(36)}`,
      provider: "capacitor",
    });
    deviceId = provisioned.device.id;
    issued = await accountCheckin.issueOfflineSnapshot(clubId, deviceId);
  }
  const next: OfflineCheckinState = {
    deviceId,
    snapshotToken: issued.snapshotToken,
    snapshot: issued.snapshot,
    queue: current?.queue ?? [],
    nextSequence: issued.snapshot.lastSequence + 1,
  };
  await persist(clubId, userId, next);
  return next;
}

export async function queueOfflineBookingCheckin(
  clubId: string,
  userId: string,
  code: string,
) {
  const loaded = await load(clubId, userId);
  if (!loaded || "corrupt" in loaded) {
    return { queued: false as const, reason: "snapshot_missing" };
  }
  const state = loaded;
  const now = new Date();
  if (isStaleSnapshot(state.snapshot, now.getTime())) {
    return { queued: false as const, reason: "stale_snapshot" };
  }
  const eligible = state.snapshot.bookings.find(
    (booking) =>
      booking.code === code.trim() &&
      new Date(booking.validFrom) <= now &&
      new Date(booking.validUntil) >= now,
  );
  if (!eligible) {
    return { queued: false as const, reason: "not_eligible" };
  }
  if (state.queue.some((item) => item.bookingCode === code.trim())) {
    return { queued: true as const, duplicate: true };
  }
  const item: QueuedCheckin = {
    clientIdempotencyKey: randomId("offline-checkin"),
    method: "manual",
    occurredAt: now.toISOString(),
    sequence:
      state.nextSequence ??
      Math.max(
        state.snapshot.lastSequence,
        ...state.queue.map((queued) => queued.sequence),
      ) + 1,
    nonce: randomId("nonce"),
    bookingCode: code.trim(),
    status: "pending",
  };
  state.queue.push(item);
  state.nextSequence = item.sequence + 1;
  await persist(clubId, userId, state);
  return { queued: true as const, duplicate: false };
}

export async function syncOfflineCheckins(clubId: string, userId: string) {
  const loaded = await load(clubId, userId);
  if (!loaded || "corrupt" in loaded) {
    return { synced: 0, remaining: 0, needsRecovery: true as const };
  }
  const state = loaded;
  const pending = state.queue.filter((item) => item.status === "pending");
  if (pending.length === 0) {
    return { synced: 0, remaining: state.queue.length, needsRecovery: false as const };
  }
  const startedAt = Date.now();
  let result;
  try {
    result = await accountCheckin.syncOfflineBatch(clubId, {
      snapshotToken: state.snapshotToken,
      items: pending.map(({ status: _status, error: _error, ...item }) => item),
      ops: buildOfflineCheckinSyncOps({
        queueDepth: state.queue.length,
        syncLatencyMs: Date.now() - startedAt,
      }),
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      await resetOfflineCheckinState(clubId, userId);
      return {
        synced: 0,
        remaining: 0,
        needsRecovery: true as const,
        recoveryReason: "revoked_device" as const,
      };
    }
    throw error;
  }
  const bySequence = new Map(result.items.map((item) => [item.sequence, item]));
  state.queue = state.queue.flatMap((item) => {
    const outcome = bySequence.get(item.sequence);
    if (!outcome) return [item];
    if (outcome.status === "created" || outcome.status === "duplicate") {
      return [];
    }
    return [
      {
        ...item,
        status: outcome.status === "review" ? "review" : "rejected",
        error: outcome.error,
      },
    ];
  });
  await persist(clubId, userId, state);
  return {
    synced: result.items.filter(
      (item) => item.status === "created" || item.status === "duplicate",
    ).length,
    remaining: state.queue.length,
    needsRecovery: false as const,
  };
}

export async function offlineCheckinQueueCount(clubId: string, userId: string) {
  const loaded = await load(clubId, userId);
  if (!loaded || "corrupt" in loaded) return 0;
  return loaded.queue.length;
}

export async function applyOfflineReconciliationResults(
  clubId: string,
  userId: string,
  rows: OfflineCheckinReconciliation[],
) {
  const loaded = await load(clubId, userId);
  if (!loaded || "corrupt" in loaded) return 0;
  const state = loaded;
  const bySequence = new Map(rows.map((row) => [row.sequence, row]));
  state.queue = state.queue.flatMap((item) => {
    const row = bySequence.get(item.sequence);
    if (!row) return [item];
    if (row.status === "accepted" || row.status === "dismissed") return [];
    if (row.status === "review" || row.status === "rejected") {
      return [{ ...item, status: row.status, error: row.reason ?? undefined }];
    }
    return [item];
  });
  await persist(clubId, userId, state);
  return state.queue.length;
}

export async function clearOfflineCheckinQueues() {
  const store = await getNativeSecureStore();
  if (!store.isNative) return;
  const rawIndex = await store.getItem(INDEX_KEY);
  let index: string[] = [];
  try {
    index = rawIndex ? (JSON.parse(rawIndex) as string[]) : [];
  } catch {
    index = [];
  }
  await Promise.all(index.map((stateKey) => store.removeItem(stateKey)));
  await store.removeItem(INDEX_KEY);
}

export async function purgeExpiredOfflineCheckinState(
  clubId: string,
  userId: string,
) {
  const loaded = await load(clubId, userId);
  if (!loaded || "corrupt" in loaded) {
    await resetOfflineCheckinState(clubId, userId);
    return { purged: true as const };
  }
  if (
    loaded.queue.length === 0 &&
    isStaleSnapshot(loaded.snapshot)
  ) {
    await resetOfflineCheckinState(clubId, userId);
    return { purged: true as const };
  }
  return { purged: false as const };
}
