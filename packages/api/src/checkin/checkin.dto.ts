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
  bookingCode?: string;
  membershipId?: string;
  userId?: string;
};

export type SyncOfflineBatchInput = {
  items: OfflineCheckInItemInput[];
};

export type SyncOfflineBatchItemResult = {
  clientIdempotencyKey: string;
  status: "created" | "duplicate" | "error";
  checkIn?: CheckIn;
  error?: string;
};

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

export type CheckInsPage = Paginated<CheckIn>;
