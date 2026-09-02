import type { ApiClient } from "../../core/client";
import type {
  ApiEntity,
  CommissionRuleInput,
  FinanceListParams,
  FinanceReconciliation,
  FinanceSummary,
  TaxRuleInput,
} from "./types";
const e = encodeURIComponent;
async function list(c: ApiClient, path: string, p: FinanceListParams = {}, s?: AbortSignal) {
  const r = await c.get<ApiEntity[]>(path, { query: p as any, ...(s ? { signal: s } : {}) });
  return { items: r.data, meta: r.meta, pagination: (r.meta as any).pagination };
}
export const financeApi = {
  summary: async (
    c: ApiClient,
    o: string,
    p: { from?: string; to?: string } = {},
    s?: AbortSignal,
  ) =>
    (
      await c.get<FinanceSummary>(`/organizations/${e(o)}/finance/summary`, {
        query: p,
        ...(s ? { signal: s } : {}),
      })
    ).data,
  adminSummary: async (c: ApiClient, p: { from?: string; to?: string } = {}, s?: AbortSignal) =>
    (
      await c.get<FinanceSummary>("/admin/finance/summary", {
        query: p,
        ...(s ? { signal: s } : {}),
      })
    ).data,
  rules: async (c: ApiClient, o: string, s?: AbortSignal) =>
    (
      await c.get<ApiEntity[]>(
        `/organizations/${e(o)}/finance/commission-rules`,
        s ? { signal: s } : undefined,
      )
    ).data,
  createRule: async (c: ApiClient, o: string, input: CommissionRuleInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(o)}/finance/commission-rules`, input)).data,
  updateRule: async (c: ApiClient, o: string, id: string, input: Partial<CommissionRuleInput>) =>
    (await c.patch<ApiEntity>(`/organizations/${e(o)}/finance/commission-rules/${e(id)}`, input))
      .data,
  taxRules: async (c: ApiClient, o: string, s?: AbortSignal) =>
    (
      await c.get<ApiEntity[]>(
        `/organizations/${e(o)}/finance/tax-rules`,
        s ? { signal: s } : undefined,
      )
    ).data,
  createTaxRule: async (c: ApiClient, o: string, input: TaxRuleInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(o)}/finance/tax-rules`, input)).data,
  updateTaxRule: async (c: ApiClient, o: string, id: string, input: Partial<TaxRuleInput>) =>
    (await c.patch<ApiEntity>(`/organizations/${e(o)}/finance/tax-rules/${e(id)}`, input)).data,
  settlements: (c: ApiClient, o: string, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(o)}/finance/settlements`, p, s),
  createSettlement: async (
    c: ApiClient,
    o: string,
    input: { starts_at: string; ends_at: string; currency?: string },
  ) => (await c.post<ApiEntity>(`/organizations/${e(o)}/finance/settlements`, input)).data,
  ledger: (c: ApiClient, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, "/admin/finance/ledger", p, s),
  adminSettlements: (c: ApiClient, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, "/admin/finance/settlements", p, s),
  pay: async (c: ApiClient, id: string, input: { reference: string; note?: string }) =>
    (await c.post<ApiEntity>(`/admin/finance/settlements/${e(id)}/pay`, input)).data,
  invoices: (c: ApiClient, o: string, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(o)}/finance/invoices`, p, s),
  refunds: (c: ApiClient, o: string, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(o)}/finance/refunds`, p, s),
  reconciliation: async (c: ApiClient, o: string, s?: AbortSignal) =>
    (
      await c.get<FinanceReconciliation>(
        `/organizations/${e(o)}/finance/reconciliation`,
        s ? { signal: s } : undefined,
      )
    ).data,
  adminInvoices: (c: ApiClient, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, "/admin/finance/invoices", p, s),
  adminRefunds: (c: ApiClient, p: FinanceListParams = {}, s?: AbortSignal) =>
    list(c, "/admin/finance/refunds", p, s),
  adminReconciliation: async (c: ApiClient, s?: AbortSignal) =>
    (
      await c.get<FinanceReconciliation>(
        "/admin/finance/reconciliation",
        s ? { signal: s } : undefined,
      )
    ).data,
  manualRefund: async (
    c: ApiClient,
    input: { payment_id: string; amount_minor: string; reason: string; idempotency_key: string },
  ) => (await c.post<ApiEntity>("/admin/finance/refunds", input)).data,
  reverseLedger: async (
    c: ApiClient,
    id: string,
    input: { reason: string; idempotency_key: string },
  ) => (await c.post<ApiEntity>(`/admin/finance/ledger/${e(id)}/reverse`, input)).data,
};
