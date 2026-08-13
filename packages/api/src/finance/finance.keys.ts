import type {
  AnalyticsPeriod,
  ListCompensationRulesQuery,
  ListDebtsQuery,
  ListInvoicesQuery,
  ListPaymentsQuery,
  ListPayoutsQuery,
} from "./finance.dto";

export const accountFinanceKeys = {
  all: ["account", "finance"] as const,
  walletOverview: () =>
    [...accountFinanceKeys.all, "wallet-overview"] as const,
  invoices: (query: ListInvoicesQuery = {}) =>
    [...accountFinanceKeys.all, "invoices", query] as const,
  invoice: (id: string) => [...accountFinanceKeys.all, "invoice", id] as const,
  ownerAnalytics: (clubId: string, period?: AnalyticsPeriod) =>
    [...accountFinanceKeys.all, "owner-analytics", clubId, period] as const,
  clubPayments: (clubId: string, query: ListPaymentsQuery = {}) =>
    [...accountFinanceKeys.all, "club-payments", clubId, query] as const,
  clubPayment: (clubId: string, paymentId: string) =>
    [...accountFinanceKeys.all, "club-payment", clubId, paymentId] as const,
  cashShifts: (clubId: string, query: Record<string, unknown> = {}) =>
    [...accountFinanceKeys.all, "cash-shifts", clubId, query] as const,
  openCashShift: (clubId: string) =>
    [...accountFinanceKeys.all, "open-cash-shift", clubId] as const,
  clubPayouts: (clubId: string, query: ListPayoutsQuery = {}) =>
    [...accountFinanceKeys.all, "club-payouts", clubId, query] as const,
  debts: (clubId: string, query: ListDebtsQuery = {}) =>
    [...accountFinanceKeys.all, "debts", clubId, query] as const,
  debt: (clubId: string, debtId: string) =>
    [...accountFinanceKeys.all, "debt", clubId, debtId] as const,
  compensationRules: (
    clubId: string,
    query: ListCompensationRulesQuery = {},
  ) =>
    [...accountFinanceKeys.all, "compensation-rules", clubId, query] as const,
};
