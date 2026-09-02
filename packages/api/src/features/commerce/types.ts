import type { ApiEntity, PaginatedResult, PaginationParams } from "../organizations/types";

export type ParticipantKind = "self" | "user" | "household_member" | "guest";
export type CheckoutPaymentMethod = "wallet" | "sandbox_gateway" | "membership";
export type PaymentMethod = CheckoutPaymentMethod | "pay_at_club" | "complimentary";

export interface BookingParticipantInput {
  kind: ParticipantKind;
  reference_id?: string;
  profile?: { full_name: string; mobile?: string; relation?: string };
}

export interface QuoteInput {
  offering_id: string;
  branch_id: string;
  starts_at: string;
  participants: BookingParticipantInput[];
  recurrence?: { frequency: "weekly"; interval: number; occurrences: number };
  promotion_code?: string;
}

export interface MoneySnapshot {
  currency: string;
  unitAmountMinor: string;
  subtotalMinor: string;
  discountMinor: string;
  taxMinor: string;
  totalMinor: string;
  pricingMode: string;
}

export interface PricingQuote extends ApiEntity {
  branchId: string;
  offeringId: string;
  occurrences: Array<{ index: number; startsAt: string; endsAt: string; allocations: ApiEntity[] }>;
  participants: ApiEntity[];
  pricing: MoneySnapshot;
  snapshot?: ApiEntity;
  expiresAt: string;
  status: "active" | "held" | "converted" | "expired";
}

export interface BookingHold extends ApiEntity {
  quoteId: string;
  allocations: ApiEntity[];
  participants: ApiEntity[];
  pricing: MoneySnapshot;
  expiresAt: string;
  status: "held" | "converted" | "released" | "expired";
}

export interface Booking extends ApiEntity {
  customerUserId?: string;
  seriesId?: string;
  branchId: string;
  offeringId: string;
  occurrenceIndex: number;
  allocations: Array<{ resourceId: string; startAt: string; endAt: string; quantity: number }>;
  participants: ApiEntity[];
  recurrence?: { type: "weekly"; index: number; total: number };
  pricing: MoneySnapshot;
  payment?: { id: string; method: PaymentMethod; status: string };
  cancellation?: ApiEntity;
  branch?: ApiEntity;
  club?: ApiEntity;
  offering?: ApiEntity;
  status: "pending_payment" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";
}

export interface CheckoutResult {
  series?: ApiEntity;
  bookings: Booking[];
  payment?: Payment;
  membership?: {
    contractId: string;
    product: ApiEntity;
    usageIds: string[];
    status: "reserved";
  };
  nextAction?: { type: "mock_gateway"; paymentId: string };
}

export interface Payment extends ApiEntity {
  payable: { type: string; id: string };
  amount: { amountMinor: string; currency: string };
  method: PaymentMethod;
  provider?: ApiEntity;
  expiresAt?: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
}

export interface HouseholdMember {
  id: string;
  userId?: string;
  profile: {
    fullName: string;
    relation?: string;
    birthDate?: string;
    gender?: string;
    mobile?: string;
  };
  status: "active" | "archived";
}

export interface Household extends ApiEntity {
  profile: { name: string };
  members: HouseholdMember[];
  status: "active" | "archived";
}

export interface WalletSummary {
  wallet: ApiEntity;
  balance: { amountMinor: string; currency: string };
  recentTransactions: ApiEntity[];
}

export interface CancellationPreview {
  calculatedAt: string;
  startsAt: string;
  remainingMinutes: number;
  totalMinor: string;
  penaltyMinor: string;
  refundableMinor: string;
  currency: string;
  paymentStatus: string;
  policy: {
    id: string;
    scope: { type: "organization" | "club"; id: string };
    profile: { name: string };
    version: number;
    matchedRuleId?: string;
    penalty: ApiEntity;
  } | null;
}

export type PenaltyInput =
  | { type: "percentage"; value: number }
  | { type: "fixed"; amount_minor: string }
  | { type: "none" };
export interface CancellationPolicyInput {
  profile: { name: string; description?: string };
  rules: Array<{
    minimum_hours_before: number;
    penalty: Exclude<PenaltyInput, { type: "none" }>;
    status?: "active" | "inactive";
  }>;
  fallback_penalty: PenaltyInput;
  settings?: { refund_destination: "wallet"; apply_to_pending_payment: boolean };
  custom_data?: ApiEntity;
  status: "draft" | "active";
}
export interface CancellationPolicy extends ApiEntity {
  scope: { type: "organization" | "club"; id: string };
  profile: { name: string; description?: string };
  rules: Array<{
    id: string;
    minimumMinutesBeforeStart: number;
    penalty: { type: string; percentageBps?: number; amountMinor?: string };
    status: string;
  }>;
  fallbackPenalty: { type: string; percentageBps?: number; amountMinor?: string };
  settings: { refundDestination: "wallet"; applyToPendingPayment: boolean };
  status: "draft" | "active" | "inactive" | "archived";
}

export interface MockGatewayResult {
  payment: Payment;
  result: { status: Payment["status"]; callbackCode: string };
}
export interface AccessPass extends ApiEntity {
  bookingId: string;
  participant: { key: string; kind: string; referenceId?: string; profile?: ApiEntity };
  branchId: string;
  validity: { startsAt: string; endsAt: string };
  status: "issued" | "used" | "revoked";
}
export interface IssuedAccessPass {
  pass: AccessPass;
  token: string;
}
export interface CheckIn extends ApiEntity {
  bookingId: string;
  accessPassId: string;
  participant: ApiEntity;
  branchId: string;
  checkedInAt: string;
  checkedOutAt?: string;
  status: "checked_in" | "checked_out";
}
export interface WaitlistEntry extends ApiEntity {
  branchId: string;
  offeringId: string;
  request: { startsAt: string; endsAt: string; participants: number; resourceIds: string[] };
  notification?: { offeredAt?: string; expiresAt?: string; channel?: string };
  status: "waiting" | "offered" | "claimed" | "expired" | "cancelled";
}
export interface StaffBookingInput {
  customer_user_id: string;
  offering_id: string;
  starts_at: string;
  participants: BookingParticipantInput[];
  payment_mode: "pay_at_club" | "complimentary";
  note?: string;
}
export interface StaffCancellationInput {
  reason: string;
  policy_mode: "apply" | "waive" | "custom";
  custom_penalty?: Exclude<PenaltyInput, { type: "none" }>;
}

export interface BookingListParams extends PaginationParams {
  status?: string;
  from?: string;
  to?: string;
}

export type BookingList = PaginatedResult<Booking>;
