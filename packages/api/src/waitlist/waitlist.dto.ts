import type { Paginated } from "../types";

export type WaitlistResourceType =
  | "club"
  | "space"
  | "slot"
  | "coach"
  | "class";

export type WaitlistEntryStatus =
  | "waiting"
  | "offered"
  | "claimed"
  | "expired"
  | "cancelled";

/** @deprecated Prefer WaitlistEntryStatus */
export type WaitlistStatus = WaitlistEntryStatus;

export type WaitlistResource = {
  type: WaitlistResourceType;
  id: string;
};

export type WaitlistEntry = {
  id: string;
  userId: string;
  priority: number;
  status: WaitlistEntryStatus;
  offeredAt?: string | null;
  offerExpiresAt?: string | null;
  joinedAt: string;
};

export type Waitlist = {
  id: string;
  resource: WaitlistResource;
  clubId?: string | null;
  occurrenceDate?: string | null;
  entries: WaitlistEntry[];
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListWaitlistsQuery = {
  page?: number;
  page_size?: number;
  resourceType?: WaitlistResourceType;
  resourceId?: string;
  occurrenceDate?: string;
};

/** @deprecated Prefer ListWaitlistsQuery */
export type ListWaitlistQuery = ListWaitlistsQuery;

export type JoinWaitlistInput = {
  resource: WaitlistResource;
  clubId?: string;
  occurrenceDate?: string;
};

export type OfferWaitlistInput = {
  offerTtlSeconds?: number;
  count?: number;
};

export type ClaimWaitlistInput = {
  entryId: string;
};

export type ExpireWaitlistOffersResult = {
  expired: number;
};

export type WaitlistsPage = Paginated<Waitlist>;
