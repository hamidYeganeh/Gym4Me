import type { AnalyticsPeriod, ListInvoicesQuery } from "./finance.dto";

export const accountFinanceKeys = {
  all: ["account", "finance"] as const,
  walletOverview: () =>
    [...accountFinanceKeys.all, "wallet-overview"] as const,
  invoices: (query: ListInvoicesQuery = {}) =>
    [...accountFinanceKeys.all, "invoices", query] as const,
  invoice: (id: string) => [...accountFinanceKeys.all, "invoice", id] as const,
  ownerAnalytics: (clubId: string, period?: AnalyticsPeriod) =>
    [...accountFinanceKeys.all, "owner-analytics", clubId, period] as const,
};
