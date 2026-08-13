import type { Paginated } from "../types";

export type MembershipStatus =
  "active" | "frozen" | "expired" | "transferred" | "cancelled";

export type MembershipPlanKind = "duration" | "sessions" | "entries";

export type MembershipHolder = {
  userId?: string;
  guest?: { name: string; phone: string };
  displayName?: string;
};

export type MembershipCredit = {
  remainingSessions?: number;
  remainingEntries?: number;
  expiresAt?: string;
};

export type MembershipPricing = {
  amount: number;
  tax?: number;
  currency: string;
};

export type ClubMembership = {
  id: string;
  clubId: string;
  planId: string;
  holder: MembershipHolder;
  status: MembershipStatus;
  credit: MembershipCredit;
  freeze?: {
    frozenAt: string;
    unfreezeAt?: string;
    reason?: string;
  };
  soldBy?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  /** Enriched on list/get responses. */
  clubName?: string;
  planName?: string;
  planKind?: MembershipPlanKind;
  sessionsTotal?: number;
  entriesTotal?: number;
  durationDays?: number;
  pricing?: MembershipPricing;
};

export type ClubMembershipPlan = {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  kind: MembershipPlanKind;
  pricing: MembershipPricing;
  durationDays?: number;
  sessionsTotal?: number;
  entriesTotal?: number;
  status: string;
  publishStatus?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListMyMembershipsQuery = {
  page?: number;
  page_size?: number;
  status?: MembershipStatus;
  clubId?: string;
};

export type ListClubMembershipsQuery = {
  page?: number;
  page_size?: number;
  status?: MembershipStatus;
  planId?: string;
  holderUserId?: string;
};

export type PaymentChannel =
  "zarinpal" | "cash" | "pos" | "card_to_card" | "wallet" | "mixed";

export type SelfPurchaseMembershipInput = {
  clubId: string;
  planId: string;
  paymentId?: string;
  channel?: PaymentChannel;
  idempotencyKey?: string;
  couponCode?: string;
};

export type SellMembershipInput = {
  planId: string;
  holder: MembershipHolder;
  paymentId?: string;
  channel?: PaymentChannel;
  idempotencyKey?: string;
  couponCode?: string;
  paidAmount?: number;
  externalRef?: string;
  tenders?: Array<{
    channel: Extract<PaymentChannel, "cash" | "pos" | "card_to_card">;
    amount: number;
    externalRef?: string;
  }>;
  debt?: {
    dueAt: string;
    installmentCount?: number;
    note?: string;
  };
};

export type ImportMembershipRow = {
  rowKey: string;
  name: string;
  phone: string;
  planId?: string;
};

export type ImportMembershipsInput = {
  batchKey: string;
  defaultPlanId?: string;
  dryRun?: boolean;
  rows: ImportMembershipRow[];
};

export type ImportMembershipsResult = {
  batchKey: string;
  dryRun: boolean;
  summary: {
    valid: number;
    imported: number;
    skipped: number;
    error: number;
  };
  results: Array<{
    rowKey: string;
    status: "valid" | "imported" | "skipped" | "error";
    membershipId?: string;
    message?: string;
  }>;
};

export type TransferMembershipInput = {
  toHolder: MembershipHolder;
  reason?: string;
};

export type CancelMembershipInput = {
  reason?: string;
};

export type ConsumeMembershipCreditInput = {
  creditKind?: "sessions" | "entries";
  amount?: number;
  reason?: string;
};

export type MembershipsPage = Paginated<ClubMembership>;
export type MembershipPlansPage = Paginated<ClubMembershipPlan>;

// ── Platform SaaS subscriptions (owner-facing) ─────────────────────────────

export type PlatformSubscriptionStatus =
  "trialing" | "active" | "past_due" | "cancelled" | "expired";

export type SubscriptionRenewalMode = "auto" | "manual";

export type PlatformPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  pricing: {
    amount: number;
    tax?: number;
    currency: string;
    periodDays: number;
  };
  features: string[];
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type PlatformSubscription = {
  id: string;
  userId: string;
  planId: string;
  status: PlatformSubscriptionStatus;
  period: { start: string; end: string };
  renewal: { mode: SubscriptionRenewalMode };
  createdAt: string;
  updatedAt: string;
};

export type PlatformPlansResponse = { result: PlatformPlan[] };
export type PlatformSubscriptionsResponse = { result: PlatformSubscription[] };

export type SubscribePlatformInput = {
  planId: string;
  renewal?: { mode: SubscriptionRenewalMode };
};

export type CancelPlatformSubscriptionInput = {
  reason?: string;
};
