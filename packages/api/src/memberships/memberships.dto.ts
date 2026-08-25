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

export type PublicMembershipPlanSummary = {
  clubId: string;
  offers: Array<{
    currency: string;
    fromAmount: number;
    planCount: number;
  }>;
};

export type PublicMembershipPlanSummariesResponse = {
  items: PublicMembershipPlanSummary[];
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

export type MembershipRenewalCredit = {
  remainingSessions?: number;
  remainingEntries?: number;
  expiresAt?: string;
};

export type MembershipRenewalPrice = {
  gross: number;
  discount: number;
  tax: number;
  payable: number;
  currency: string;
};

export type MembershipRenewalPreview = {
  previewFingerprint: string;
  consentVersion: "membership-renewal-v1";
  membershipId: string;
  plan: {
    id: string;
    name: string;
    kind: MembershipPlanKind;
  };
  price: MembershipRenewalPrice;
  currentCredit: MembershipRenewalCredit;
  renewedCredit: MembershipRenewalCredit;
};

export type PreviewMembershipRenewalInput = {
  couponCode?: string;
};

export type RenewMembershipInput = PreviewMembershipRenewalInput & {
  idempotencyKey: string;
  previewFingerprint: string;
  consentVersion: "membership-renewal-v1";
  consentAccepted: true;
  channel?: Extract<
    PaymentChannel,
    "cash" | "pos" | "card_to_card" | "mixed"
  >;
  paidAmount?: number;
  externalRef?: string;
  tenders?: SellMembershipInput["tenders"];
  debt?: SellMembershipInput["debt"];
};

export type MembershipRenewalResult = {
  membership: ClubMembership;
  renewal: {
    previewFingerprint?: string;
    consentVersion: "membership-renewal-v1";
    price: MembershipRenewalPrice;
    renewedCredit: MembershipRenewalCredit;
    paymentId?: string;
    debtId?: string;
  };
  idempotent: boolean;
};

export type MembershipCheckoutMode = "purchase" | "renewal";
export type MembershipCheckoutStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "expired";

export type PreviewMembershipCheckoutInput = {
  clubId: string;
  planId: string;
  membershipId?: string;
};

export type MembershipCheckoutPreview = {
  mode: MembershipCheckoutMode;
  fingerprint: string;
  consentVersion: "membership-checkout-v1" | "membership-renewal-v1";
  plan: { id: string; name: string; kind: MembershipPlanKind };
  price: MembershipRenewalPrice;
  currentCredit: MembershipRenewalCredit;
  resultingCredit: MembershipRenewalCredit;
};

export type InitiateMembershipCheckoutInput = PreviewMembershipCheckoutInput & {
  idempotencyKey: string;
  previewFingerprint: string;
  consentVersion: MembershipCheckoutPreview["consentVersion"];
  consentAccepted: true;
  callbackUrl: string;
};

export type MembershipCheckoutInitiation = {
  checkoutId: string;
  mode: MembershipCheckoutMode;
  fingerprint: string;
  consentVersion: MembershipCheckoutPreview["consentVersion"];
  price: MembershipRenewalPrice;
  resultingCredit: MembershipRenewalCredit;
  authority: string;
  redirectUrl: string;
  expiresAt: string;
  idempotent: boolean;
};

export type VerifyMembershipCheckoutInput = {
  authority: string;
  status: "OK" | "NOK";
};

export type MembershipCheckoutResult = {
  checkoutId: string;
  status: MembershipCheckoutStatus;
  membershipId?: string;
  paymentId?: string;
  idempotent: boolean;
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

export type PlatformSubscriptionCheckoutPreview = {
  fingerprint: string;
  consentVersion: string;
  plan: { id: string; name: string; periodDays: number };
  price: {
    gross: number;
    tax: number;
    payable: number;
    currency: string;
  };
  renewalMode: SubscriptionRenewalMode;
};

export type PreviewPlatformSubscriptionCheckoutInput = {
  planId: string;
  renewalMode?: SubscriptionRenewalMode;
};

export type InitiatePlatformSubscriptionCheckoutInput =
  PreviewPlatformSubscriptionCheckoutInput & {
    idempotencyKey: string;
    previewFingerprint: string;
    consentVersion: string;
    consentAccepted: true;
    callbackUrl: string;
  };

export type PlatformSubscriptionCheckoutInitiation = {
  checkoutId: string;
  authority: string;
  redirectUrl: string;
  expiresAt: string;
  idempotent: boolean;
};

export type VerifyPlatformSubscriptionCheckoutInput = {
  authority: string;
  status: "OK" | "NOK";
};

export type PlatformSubscriptionCheckoutResult = {
  checkoutId: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  subscriptionId?: string;
  paymentId?: string;
  gatewayRefId?: string;
  idempotent: boolean;
};
