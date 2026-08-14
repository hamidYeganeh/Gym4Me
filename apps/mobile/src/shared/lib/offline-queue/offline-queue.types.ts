import type { SyncProgressMetricInput } from "@repo/api";

export type OfflineQueueItemStatus =
  | "queued"
  | "sending"
  | "synced"
  | "retryable_error"
  | "rejected_needs_user";

export type OfflineMetricPayload = SyncProgressMetricInput & {
  clientMutationId: string;
};

export type OfflineQueueItem = {
  id: string;
  kind: "metric";
  status: OfflineQueueItemStatus;
  payload: OfflineMetricPayload;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError: string | null;
};

export type OfflineQueueFlushResult = {
  synced: number;
  retryable: number;
  rejected: number;
};
