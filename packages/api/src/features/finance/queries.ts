"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { financeApi } from "./api";
import type { FinanceListParams } from "./types";
export const financeKeys = {
  all: ["finance"] as const,
  rules: (o: string) => ["finance", o, "rules"] as const,
  taxRules: (o: string) => ["finance", o, "tax-rules"] as const,
  settlements: (o: string, p: unknown) => ["finance", o, "settlements", p] as const,
  ledger: (p: unknown) => ["admin", "finance", "ledger", p] as const,
  adminSettlements: (p: unknown) => ["admin", "finance", "settlements", p] as const,
  summary: (o: string, p: unknown) => ["finance", o, "summary", p] as const,
  adminSummary: (p: unknown) => ["admin", "finance", "summary", p] as const,
  invoices: (o: string, p: unknown) => ["finance", o, "invoices", p] as const,
  refunds: (o: string, p: unknown) => ["finance", o, "refunds", p] as const,
  reconciliation: (o: string) => ["finance", o, "reconciliation"] as const,
  adminInvoices: (p: unknown) => ["admin", "finance", "invoices", p] as const,
  adminRefunds: (p: unknown) => ["admin", "finance", "refunds", p] as const,
  adminReconciliation: ["admin", "finance", "reconciliation"] as const,
};
export function useCommissionRulesQuery(o: string) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.rules(o),
    queryFn: ({ signal }) => financeApi.rules(c, o, signal),
    enabled: Boolean(o),
  });
}
export function useTaxRulesQuery(o: string) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.taxRules(o),
    queryFn: ({ signal }) => financeApi.taxRules(c, o, signal),
    enabled: Boolean(o),
  });
}
export function useSettlementsQuery(o: string, p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.settlements(o, p),
    queryFn: ({ signal }) => financeApi.settlements(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useAdminLedgerQuery(p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.ledger(p),
    queryFn: ({ signal }) => financeApi.ledger(c, p, signal),
  });
}
export function useAdminSettlementsQuery(p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.adminSettlements(p),
    queryFn: ({ signal }) => financeApi.adminSettlements(c, p, signal),
  });
}
export function useFinanceSummaryQuery(o: string, p: { from?: string; to?: string } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.summary(o, p),
    queryFn: ({ signal }) => financeApi.summary(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useAdminFinanceSummaryQuery(p: { from?: string; to?: string } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.adminSummary(p),
    queryFn: ({ signal }) => financeApi.adminSummary(c, p, signal),
  });
}
export function useFinanceInvoicesQuery(o: string, p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.invoices(o, p),
    queryFn: ({ signal }) => financeApi.invoices(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useFinanceRefundsQuery(o: string, p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.refunds(o, p),
    queryFn: ({ signal }) => financeApi.refunds(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useFinanceReconciliationQuery(o: string) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.reconciliation(o),
    queryFn: ({ signal }) => financeApi.reconciliation(c, o, signal),
    enabled: Boolean(o),
  });
}
export function useAdminFinanceInvoicesQuery(p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.adminInvoices(p),
    queryFn: ({ signal }) => financeApi.adminInvoices(c, p, signal),
  });
}
export function useAdminFinanceRefundsQuery(p: FinanceListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.adminRefunds(p),
    queryFn: ({ signal }) => financeApi.adminRefunds(c, p, signal),
  });
}
export function useAdminFinanceReconciliationQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: financeKeys.adminReconciliation,
    queryFn: ({ signal }) => financeApi.adminReconciliation(c, signal),
  });
}
