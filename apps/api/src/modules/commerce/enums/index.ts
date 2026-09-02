export const PARTICIPANT_KINDS = ["self", "user", "household_member", "guest"] as const;
export type ParticipantKind = (typeof PARTICIPANT_KINDS)[number];

export const PAYMENT_METHODS = ["wallet", "sandbox_gateway", "membership"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const HOUSEHOLD_GENDERS = ["female", "male", "other", "unspecified"] as const;
export type HouseholdGender = (typeof HOUSEHOLD_GENDERS)[number];

export const PENALTY_TYPES = ["percentage", "fixed"] as const;
export type PenaltyType = (typeof PENALTY_TYPES)[number];

export const FALLBACK_PENALTY_TYPES = ["percentage", "fixed", "none"] as const;
export type FallbackPenaltyType = (typeof FALLBACK_PENALTY_TYPES)[number];

export const POLICY_STATUSES = ["draft", "active"] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export const MOCK_PAYMENT_DECISIONS = ["approve", "cancel"] as const;
export type MockPaymentDecision = (typeof MOCK_PAYMENT_DECISIONS)[number];

export const STAFF_PAYMENT_MODES = ["pay_at_club", "complimentary"] as const;
export type StaffPaymentMode = (typeof STAFF_PAYMENT_MODES)[number];

export const CANCEL_POLICY_MODES = ["apply", "waive", "custom"] as const;
export type CancelPolicyMode = (typeof CANCEL_POLICY_MODES)[number];

export const CANCELLATION_SCOPES = ["organization", "club"] as const;
export type CancellationScope = (typeof CANCELLATION_SCOPES)[number];

export const BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "rejected",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const HOLD_STATUSES = ["held", "converted", "released", "expired"] as const;
export type HoldStatus = (typeof HOLD_STATUSES)[number];

export const WAITLIST_STATUSES = ["waiting", "offered", "claimed", "expired", "cancelled"] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export const ACCESS_PASS_STATUSES = ["issued", "used", "revoked", "expired"] as const;
export type AccessPassStatus = (typeof ACCESS_PASS_STATUSES)[number];

export const CHECK_IN_STATUSES = ["checked_in", "checked_out"] as const;
export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];

export const LEDGER_SIDES = ["debit", "credit"] as const;
export type LedgerSide = (typeof LEDGER_SIDES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "expired", "cancelled"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REFUND_STATUSES = ["pending", "refunded", "failed"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const IDEMPOTENCY_STATUSES = ["processing", "completed", "failed"] as const;
export type IdempotencyStatus = (typeof IDEMPOTENCY_STATUSES)[number];
