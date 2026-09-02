import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface CommissionRuleInput {
  profile: { name: string; description?: Record<string, string> };
  applies_to?: { booking_types?: string[]; offering_ids?: string[] };
  calculation: {
    type: "percentage" | "fixed";
    percentage_bps?: number;
    amount_minor?: string;
    currency?: string;
  };
  priority?: number;
  status?: "draft" | "active" | "archived";
}
export interface TaxRuleInput {
  scope: { type: "organization" | "branch" | "offering"; id: string };
  profile: { name: string; description?: Record<string, string> };
  calculation: {
    type: "percentage" | "fixed";
    percentage_bps?: number;
    amount_minor?: string;
    currency?: string;
    price_mode?: "inherit" | "inclusive" | "exclusive";
  };
  validity?: { starts_at?: string | Date; ends_at?: string | Date };
  priority?: number;
  status?: "draft" | "active" | "archived";
}
export interface FinanceListParams extends PaginationParams {
  status?: string;
}
export interface FinanceSummary extends ApiEntity {
  period: { from: string; to: string };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    checkIns: number;
    completionRate: number;
  };
  revenue: { grossMinor: string; currency: string };
  memberships: { sold: number; usages: number };
  settlements: { approvedPayableMinor: string; paidMinor: string };
  topOfferings: Array<{ id: string; name: string; bookings: number; grossMinor: string }>;
}
export interface FinanceReconciliation extends ApiEntity {
  status: "balanced" | "attention_required";
  checkedAt: string;
  counts: {
    payments: number;
    invoices: number;
    refunds: number;
    missingLedger: number;
    missingInvoice: number;
    inconsistentRefunds: number;
  };
  issues: {
    paymentsWithoutLedger: string[];
    paymentsWithoutInvoice: string[];
    refundsWithoutLedger: string[];
  };
}
