"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { financeApi } from "./api";
import { financeKeys } from "./queries";
import type { CommissionRuleInput, TaxRuleInput } from "./types";
export function useCreateCommissionRuleMutation(o: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (i: CommissionRuleInput) => financeApi.createRule(c, o, i),
    onSuccess: async () => q.invalidateQueries({ queryKey: financeKeys.rules(o) }),
  });
}
export function useUpdateCommissionRuleMutation(o: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CommissionRuleInput> }) =>
      financeApi.updateRule(c, o, id, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: financeKeys.rules(o) }),
  });
}
export function useCreateTaxRuleMutation(o: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: TaxRuleInput) => financeApi.createTaxRule(c, o, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: financeKeys.taxRules(o) }),
  });
}
export function useUpdateTaxRuleMutation(o: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaxRuleInput> }) =>
      financeApi.updateTaxRule(c, o, id, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: financeKeys.taxRules(o) }),
  });
}
export function useCreateSettlementMutation(o: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (i: { starts_at: string; ends_at: string; currency?: string }) =>
      financeApi.createSettlement(c, o, i),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["finance", o, "settlements"] }),
  });
}
export function usePaySettlementMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...i }: { id: string; reference: string; note?: string }) =>
      financeApi.pay(c, id, i),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["finance"] }),
  });
}
export function useManualRefundMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: { payment_id: string; amount_minor: string; reason: string }) =>
      financeApi.manualRefund(c, { ...input, idempotency_key: crypto.randomUUID() }),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["admin", "finance"] }),
  });
}
export function useReverseLedgerMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financeApi.reverseLedger(c, id, { reason, idempotency_key: crypto.randomUUID() }),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["admin", "finance"] }),
  });
}
