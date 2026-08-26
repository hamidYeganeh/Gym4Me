import type { HealthSyncProvider, SyncProgressMetricInput } from "@repo/api";

export type HealthSyncQueueItemStatus =
  | "queued"
  | "sending"
  | "synced"
  | "retryable_error"
  | "poison"
  | "rejected_needs_user";

export type HealthSyncQueuePayload = SyncProgressMetricInput & {
  source: HealthSyncProvider;
  sourceRecordId: string;
  clientMutationId: string;
};

export type HealthSyncQueueItem = {
  id: string;
  userId: string;
  provider: HealthSyncProvider;
  metricKey: string;
  sourceRecordId: string;
  payloadFingerprint: string;
  clientMutationId: string;
  status: HealthSyncQueueItemStatus;
  payload: HealthSyncQueuePayload;
  attempts: number;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HealthSyncQueueFlushResult = {
  synced: number;
  deduplicatedHint: number;
  retryable: number;
  rejected: number;
  poison: number;
  remaining: number;
  latencyMs: number;
  rejectedReasons: string[];
};

export type HealthSyncQueueSummary = {
  pending: number;
  retryable: number;
  poison: number;
  rejected: number;
  oldestPendingAt: string | null;
};
