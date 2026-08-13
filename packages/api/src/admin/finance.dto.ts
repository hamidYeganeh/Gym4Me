import type { Paginated } from "../types";

export type LedgerEntryKind =
  | "payment"
  | "wallet_topup"
  | "wallet_spend"
  | "payout"
  | "refund"
  | "adjustment";

export type AdminLedgerLine = {
  account: string;
  debit: number;
  credit: number;
  party?: { type: string; id: string };
};

export type AdminLedgerEntry = {
  id: string;
  kind: LedgerEntryKind | string;
  paymentId?: string | null;
  lines: AdminLedgerLine[];
  split?: {
    gross?: number;
    amount?: number;
    discount?: number;
    tax?: number;
    providerShare?: number;
    platformFee?: number;
    gatewayFee?: number;
    net?: number;
  };
  related?: {
    clubId?: string | null;
    userId?: string | null;
    bookingId?: string | null;
  };
  dedupeKey?: string;
  occurredAt: string;
  note?: string | null;
  createdAt?: string;
};

export type ListAdminLedgerQuery = {
  page?: number;
  page_size?: number;
  kind?: LedgerEntryKind | string;
  clubId?: string;
  paymentId?: string;
  from?: string;
  to?: string;
};

export type AdminLedgerPage = Paginated<AdminLedgerEntry>;

// ── Payments & payouts (shared shapes with account finance) ────────────────

export type {
  CreatePayoutInput,
  DraftPeriodPayoutInput,
  ListPaymentsQuery,
  ListPayoutsQuery,
  PaymentRecord,
  PaymentsPage,
  PaymentWithLedger,
  Payout,
  PayoutsPage,
  ResolvePayoutDisputeInput,
} from "../finance/finance.dto";

export type ListAdminPaymentsQuery = {
  page?: number;
  page_size?: number;
  status?: string;
  channel?: string;
  purpose?: string;
  clubId?: string;
  payerUserId?: string;
};

export type SettlePayoutInput = {
  note?: string;
};
