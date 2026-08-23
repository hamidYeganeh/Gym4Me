import type { Paginated } from "../types";

export type InvoiceStatus = "issued" | "void";
export type AnalyticsPeriod = "week" | "month" | "quarter";

export type InvoiceLine = {
  title: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  id: string;
  paymentId: string;
  number: string;
  title: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  amounts: {
    subtotal: number;
    discount: number;
    tax: number;
    payable: number;
  };
  party: {
    payerUserId: string | null;
    clubName: string | null;
    clubId: string | null;
  };
  issuedAt: string;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletOverview = {
  owner: { type: string; id: string };
  balance: number;
  currency: string;
  balancePoints: { label: string; value: number }[];
  incomeSeries: number[];
  spendSeries: number[];
};

export type OwnerFinanceKpi = {
  id: "new-members" | "renewal" | "churn" | "attendance" | string;
  value: number;
  chart: "line" | "bar";
  series: number[];
  comparisonSeries?: number[];
};

export type OwnerFinanceAnalytics = {
  period: AnalyticsPeriod;
  kpis: OwnerFinanceKpi[];
  totals: {
    activeMembers: number;
    newMembers: number;
    cancelledMembers: number;
    capturedGross: number;
  };
};

export type ListInvoicesQuery = {
  page?: number;
  page_size?: number;
  status?: InvoiceStatus;
};

export type IssueInvoiceFromPaymentInput = {
  paymentId: string;
};

export type InvoicesPage = Paginated<Invoice>;

// ── Owner desk ops (mirror apps/api finance enums) ─────────────────────────

export type PaymentChannel =
  "zarinpal" | "cash" | "pos" | "card_to_card" | "wallet" | "mixed";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

export type PaymentRefundMethod = "gateway_reverse" | "wallet_credit";

export type PaymentPurpose =
  | "booking"
  | "membership"
  | "wallet_topup"
  | "package"
  | "platform_subscription"
  | "manual";

export type PaymentAmountSplit = {
  pricingVersion?: string;
  gross: number;
  discount?: number;
  tax?: number;
  providerShare?: number;
  platformFee?: number;
  gatewayFee?: number;
  net?: number;
};

export type PaymentPayer = {
  userId?: string | null;
  guest?: { name: string; phone: string } | null;
};

export type PaymentRelated = {
  bookingId?: string | null;
  membershipId?: string | null;
  packageId?: string | null;
  clubId?: string | null;
  coachUserId?: string | null;
};

export type PaymentTender = {
  channel: Extract<PaymentChannel, "cash" | "pos" | "card_to_card">;
  amount: number;
  externalRef?: string | null;
};

/** Raw payment doc as returned by the API (lean Mongo doc). */
export type PaymentRecord = {
  _id: string;
  purpose: PaymentPurpose;
  channel: PaymentChannel;
  status: PaymentStatus;
  amount: PaymentAmountSplit;
  reference: {
    orderId: string;
    authority?: string | null;
    gatewayRefId?: string | null;
    externalRef?: string | null;
    redirectUrl?: string | null;
  };
  payer: PaymentPayer;
  tenders?: PaymentTender[] | null;
  related?: PaymentRelated | null;
  note?: string | null;
  operatorNote?: string | null;
  capturedAt?: string | null;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  refundedAmount?: number;
  refunds?: Array<{
    amount: number;
    method: PaymentRefundMethod;
    idempotencyKey: string;
    status: "pending" | "succeeded" | "failed";
    processedBy: string;
    providerCode?: string | null;
    providerMessage?: string | null;
    lastError?: string | null;
    processedAt: string;
    succeededAt?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ListPaymentsQuery = {
  page?: number;
  page_size?: number;
  status?: PaymentStatus;
  channel?: PaymentChannel;
  purpose?: PaymentPurpose;
  payerUserId?: string;
};

export type PaymentsPage = Paginated<PaymentRecord>;

export type PaymentWithLedger = {
  payment: PaymentRecord;
  ledger: Record<string, unknown> | null;
};

export type RecordManualPaymentInput = {
  purpose: PaymentPurpose;
  channel: Extract<PaymentChannel, "cash" | "pos" | "card_to_card" | "mixed">;
  amount: PaymentAmountSplit;
  reference: { orderId: string; externalRef?: string };
  payer: { userId?: string; guest?: { name: string; phone: string } };
  tenders?: PaymentTender[];
  related?: {
    bookingId?: string;
    membershipId?: string;
    packageId?: string;
    coachUserId?: string;
  };
  idempotencyKey: string;
  operatorNote?: string;
};

// ── Cash shifts ─────────────────────────────────────────────────────────────

export type CashShiftStatus = "open" | "closed";

export type CashShiftTotals = {
  cash: number;
  pos: number;
  cardToCard: number;
  other: number;
};

export type CashShift = {
  _id: string;
  clubId: string;
  status: CashShiftStatus;
  openedBy: string;
  openedAt: string;
  closedBy?: string | null;
  closedAt?: string | null;
  counted?: CashShiftTotals | null;
  expected?: CashShiftTotals | null;
  varianceNote?: string | null;
};

export type CashShiftsPage = Paginated<CashShift>;

export type CloseCashShiftInput = {
  counted: CashShiftTotals;
  varianceNote?: string;
};

// ── Payouts ─────────────────────────────────────────────────────────────────

export type PayoutStatus =
  "pending" | "processing" | "settled" | "disputed" | "cancelled";

export type PayoutRecipientType = "club" | "coach";

export type Payout = {
  _id: string;
  recipient: { type: PayoutRecipientType; id: string };
  status: PayoutStatus;
  amount: number;
  currency: string;
  period: { from: string; to: string };
  clubId?: string | null;
  note?: string | null;
  dispute?: {
    status: "open" | "resolved" | "rejected";
    reason?: string | null;
    note?: string | null;
  } | null;
  settledAt?: string | null;
  createdAt: string;
};

export type PayoutsPage = Paginated<Payout>;

export type ListPayoutsQuery = {
  page?: number;
  page_size?: number;
  status?: PayoutStatus;
  recipientType?: PayoutRecipientType;
  recipientId?: string;
};

export type CreatePayoutInput = {
  recipientType: PayoutRecipientType;
  recipientId: string;
  amount: number;
  periodFrom: string;
  periodTo: string;
  note?: string;
};

export type DraftPeriodPayoutInput = {
  recipientType: PayoutRecipientType;
  recipientId: string;
  periodFrom: string;
  periodTo: string;
  note?: string;
};

export type ResolvePayoutDisputeInput = {
  resolution: "resolved" | "rejected";
  note?: string;
  reverseSettledAmount?: boolean;
};

// ── Debts ───────────────────────────────────────────────────────────────────

export type DebtStatus = "open" | "partial" | "settled" | "written_off";

export type DebtInstallment = {
  amount: number;
  dueAt: string;
  status: "scheduled" | "due" | "paid" | "overdue" | "cancelled";
  paidAt?: string | null;
};

export type Debt = {
  _id: string;
  clubId: string;
  holder: PaymentPayer;
  membershipId?: string | null;
  status: DebtStatus;
  principal: number;
  paid: number;
  dueAt: string;
  note?: string | null;
  installments?: DebtInstallment[];
  createdAt: string;
};

export type DebtsPage = Paginated<Debt>;

export type ListDebtsQuery = {
  page?: number;
  page_size?: number;
  status?: DebtStatus;
};

export type CreateDebtInput = {
  holder: { userId?: string; guest?: { name: string; phone: string } };
  membershipId?: string;
  principal: number;
  dueAt: string;
  note?: string;
  installmentCount?: number;
};

export type RecordDebtPaymentInput = {
  amount: number;
  channel: PaymentChannel;
  idempotencyKey: string;
  orderId?: string;
  operatorNote?: string;
};

// ── Compensation rules ──────────────────────────────────────────────────────

export type CompensationBasis =
  "per_session" | "attendance" | "revenue_percent" | "fixed";

export type CompensationRule = {
  _id: string;
  clubId: string;
  coachUserId?: string | null;
  basis: CompensationBasis;
  rate: number;
  status: "active" | "inactive" | "archived";
  effectiveFrom: string;
  effectiveTo?: string | null;
  note?: string | null;
};

export type CompensationRulesPage = Paginated<CompensationRule>;

export type ListCompensationRulesQuery = {
  page?: number;
  page_size?: number;
  coachUserId?: string;
  status?: "active" | "inactive" | "archived";
};

export type UpsertCompensationRuleInput = {
  id?: string;
  coachUserId?: string;
  basis: CompensationBasis;
  rate: number;
  status?: "active" | "inactive" | "archived";
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
};
