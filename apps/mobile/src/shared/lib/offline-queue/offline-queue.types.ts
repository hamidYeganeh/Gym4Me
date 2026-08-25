import type {
  CreateWorkoutLogInput,
  SyncProgressMetricInput,
  UpdateWorkoutLogInput,
} from "@repo/api";

export type OfflineQueueItemStatus =
  | "queued"
  | "sending"
  | "synced"
  | "retryable_error"
  | "rejected_needs_user";

export type OfflineMetricPayload = SyncProgressMetricInput & {
  clientMutationId: string;
};

type OfflineQueueItemBase = {
  id: string;
  status: OfflineQueueItemStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError: string | null;
};

export type OfflineMetricQueueItem = OfflineQueueItemBase & {
  kind: "metric";
  payload: OfflineMetricPayload;
};

export type OfflineWorkoutCreatePayload = {
  operation: "create";
  localLogId: string;
  input: CreateWorkoutLogInput & { clientMutationId: string };
};

export type OfflineWorkoutUpdatePayload = {
  operation: "update";
  planId: string;
  localLogId: string;
  serverLogId?: string;
  input: UpdateWorkoutLogInput;
};

export type OfflineWorkoutTransitionPayload = {
  operation: "complete" | "skip";
  planId: string;
  localLogId: string;
  serverLogId?: string;
};

export type OfflineWorkoutPayload =
  | OfflineWorkoutCreatePayload
  | OfflineWorkoutUpdatePayload
  | OfflineWorkoutTransitionPayload;

export type OfflineWorkoutQueueItem = OfflineQueueItemBase & {
  kind: "workout";
  payload: OfflineWorkoutPayload;
  serverResourceId: string | null;
};

export type OfflineQueueItem =
  | OfflineMetricQueueItem
  | OfflineWorkoutQueueItem;

export type OfflineQueueFlushResult = {
  synced: number;
  retryable: number;
  rejected: number;
};
