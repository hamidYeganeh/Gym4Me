import type { Paginated } from "../types";

export type CheckInMethod = "qr" | "barcode" | "manual";

export type CheckIn = {
  id: string;
  clubId: string;
  userId?: string;
  bookingId?: string;
  membershipId?: string;
  method: CheckInMethod;
  occurredAt: string;
  createdAt: string;
};

export type ListCheckInsQuery = {
  page?: number;
  page_size?: number;
  userId?: string;
  bookingId?: string;
  from?: string;
  to?: string;
};

export type CheckInByBookingCodeInput = {
  code: string;
  method?: CheckInMethod;
  clientIdempotencyKey?: string;
  occurredAt?: string;
};

export type CheckInByMembershipInput = {
  membershipId: string;
  userId: string;
  method?: CheckInMethod;
  clientIdempotencyKey?: string;
  occurredAt?: string;
};

export type OfflineCheckInItemInput = {
  clientIdempotencyKey: string;
  method: CheckInMethod;
  occurredAt: string;
  sequence: number;
  nonce: string;
  bookingCode?: string;
  membershipId?: string;
  userId?: string;
};

export type SyncOfflineBatchInput = {
  snapshotToken: string;
  items: OfflineCheckInItemInput[];
};

export type SyncOfflineBatchItemResult = {
  clientIdempotencyKey: string;
  sequence: number;
  status: "created" | "duplicate" | "processing" | "review" | "rejected";
  checkIn?: CheckIn;
  checkInId?: string | null;
  error?: string;
};

export type OfflineCheckinSnapshot = {
  id: string;
  clubId: string;
  deviceId: string;
  deviceCredentialVersion: number;
  issuedAt: string;
  expiresAt: string;
  syncDeadline: string;
  maxEvents: number;
  lastSequence: number;
  bookings: Array<{
    bookingId: string;
    userId: string;
    code: string;
    validFrom: string;
    validUntil: string;
  }>;
  memberships: Array<{
    membershipId: string;
    userId: string;
    validUntil: string | null;
  }>;
};

export type IssueOfflineCheckinSnapshotResult = {
  snapshotToken: string;
  snapshot: OfflineCheckinSnapshot;
};

export type OfflineCheckinReconciliation = {
  id: string;
  snapshotId: string;
  deviceId: string;
  sequence: number;
  status: "processing" | "accepted" | "review" | "rejected" | "dismissed";
  payload: Omit<OfflineCheckInItemInput, "sequence" | "nonce">;
  checkInId: string | null;
  reason: string | null;
  reasonCode: string | null;
  lastResolution: {
    clientMutationId: string;
    action: "retry" | "dismiss";
    actorId: string;
    reason: string;
    outcome: "accepted" | "review" | "dismissed";
    resolvedAt: string;
  } | null;
  reconciledAt: string | null;
  createdAt: string;
};

export type ResolveOfflineCheckinReconciliationInput = {
  action: "retry" | "dismiss";
  reason: string;
  clientMutationId: string;
};

export type OfflineCheckinReconciliationsPage =
  Paginated<OfflineCheckinReconciliation>;

export type SyncOfflineBatchResult = {
  items: SyncOfflineBatchItemResult[];
};

export type CheckinDevice = {
  id: string;
  clubId: string;
  name: string;
  provider: string;
  status: "active" | "revoked";
  lastSeenAt: string | null;
  createdAt: string;
};

export type ProvisionCheckinDeviceInput = {
  name: string;
  provider?: string;
};

export type ProvisionCheckinDeviceResult = {
  device: CheckinDevice;
  /** Display once and store in the hardware configuration. */
  secret: string;
};

export type RevokeCheckinDeviceResult = { device: CheckinDevice };

export type CheckInsPage = Paginated<CheckIn>;
