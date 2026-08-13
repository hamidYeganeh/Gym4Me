import type {
  ListAdminLedgerQuery,
  ListAdminPaymentsQuery,
  ListPayoutsQuery,
} from "./finance.dto";

export const adminFinanceKeys = {
  all: ["admin", "finance"] as const,
  ledger: (query: ListAdminLedgerQuery = {}) =>
    [...adminFinanceKeys.all, "ledger", query] as const,
  payments: (query: ListAdminPaymentsQuery = {}) =>
    [...adminFinanceKeys.all, "payments", query] as const,
  payment: (id: string) => [...adminFinanceKeys.all, "payment", id] as const,
  payouts: (query: ListPayoutsQuery & { clubId?: string } = {}) =>
    [...adminFinanceKeys.all, "payouts", query] as const,
};
