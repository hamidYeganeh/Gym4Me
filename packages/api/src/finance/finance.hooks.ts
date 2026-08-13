import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountFinanceApi,
  type AccountFinanceApi,
} from "./finance.client";
import type {
  AnalyticsPeriod,
  CashShift,
  CashShiftsPage,
  CloseCashShiftInput,
  CompensationRulesPage,
  CreateDebtInput,
  CreatePayoutInput,
  Debt,
  DebtsPage,
  DraftPeriodPayoutInput,
  Invoice,
  InvoicesPage,
  ListCompensationRulesQuery,
  ListDebtsQuery,
  ListInvoicesQuery,
  ListPaymentsQuery,
  ListPayoutsQuery,
  OwnerFinanceAnalytics,
  PaymentsPage,
  PaymentWithLedger,
  PayoutsPage,
  RecordDebtPaymentInput,
  RecordManualPaymentInput,
  ResolvePayoutDisputeInput,
  UpsertCompensationRuleInput,
  WalletOverview,
} from "./finance.dto";
import { accountFinanceKeys } from "./finance.keys";

function useAccountFinanceApi(): AccountFinanceApi {
  const client = useApiClient();
  return useMemo(() => createAccountFinanceApi(client), [client]);
}

export function useWalletOverview(
  options?: Omit<
    UseQueryOptions<WalletOverview, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.walletOverview(),
    queryFn: () => api.walletOverview(),
    ...options,
  });
}

export function useInvoices(
  query: ListInvoicesQuery = {},
  options?: Omit<
    UseQueryOptions<InvoicesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.invoices(query),
    queryFn: () => api.listInvoices(query),
    ...options,
  });
}

export function useInvoice(
  id: string,
  options?: Omit<UseQueryOptions<Invoice, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.invoice(id),
    queryFn: () => api.getInvoice(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useOwnerFinanceAnalytics(
  clubId: string,
  period?: AnalyticsPeriod,
  options?: Omit<
    UseQueryOptions<OwnerFinanceAnalytics, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.ownerAnalytics(clubId, period),
    queryFn: () => api.ownerAnalytics(clubId, period),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

// ── Owner desk ops ──────────────────────────────────────────────────────────

export function useClubPayments(
  clubId: string,
  query: ListPaymentsQuery = {},
  options?: Omit<
    UseQueryOptions<PaymentsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.clubPayments(clubId, query),
    queryFn: () => api.listClubPayments(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useClubPayment(
  clubId: string,
  paymentId: string,
  options?: Omit<
    UseQueryOptions<PaymentWithLedger, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.clubPayment(clubId, paymentId),
    queryFn: () => api.getClubPayment(clubId, paymentId),
    ...options,
    enabled:
      Boolean(clubId) && Boolean(paymentId) && (options?.enabled ?? true),
  });
}

export function useRecordManualPayment(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordManualPaymentInput) =>
      api.recordManualPayment(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useCashShifts(
  clubId: string,
  query: { page?: number; page_size?: number } = {},
  options?: Omit<
    UseQueryOptions<CashShiftsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.cashShifts(clubId, query),
    queryFn: () => api.listCashShifts(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useOpenCashShift(
  clubId: string,
  options?: Omit<
    UseQueryOptions<CashShift | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.openCashShift(clubId),
    queryFn: () => api.getOpenCashShift(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useOpenCashShiftMutation(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.openCashShift(clubId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useCloseCashShift(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shiftId,
      input,
    }: {
      shiftId: string;
      input: CloseCashShiftInput;
    }) => api.closeCashShift(clubId, shiftId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useClubPayouts(
  clubId: string,
  query: ListPayoutsQuery = {},
  options?: Omit<UseQueryOptions<PayoutsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.clubPayouts(clubId, query),
    queryFn: () => api.listClubPayouts(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useCreatePayout(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePayoutInput) => api.createPayout(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useDraftPeriodPayout(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DraftPeriodPayoutInput) =>
      api.draftPeriodPayout(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useOpenPayoutDispute(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: string; reason: string }) =>
      api.openPayoutDispute(clubId, payoutId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useResolvePayoutDispute(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payoutId,
      input,
    }: {
      payoutId: string;
      input: ResolvePayoutDisputeInput;
    }) => api.resolvePayoutDispute(clubId, payoutId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useDebts(
  clubId: string,
  query: ListDebtsQuery = {},
  options?: Omit<UseQueryOptions<DebtsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.debts(clubId, query),
    queryFn: () => api.listDebts(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useDebt(
  clubId: string,
  debtId: string,
  options?: Omit<UseQueryOptions<Debt, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.debt(clubId, debtId),
    queryFn: () => api.getDebt(clubId, debtId),
    ...options,
    enabled: Boolean(clubId) && Boolean(debtId) && (options?.enabled ?? true),
  });
}

export function useCreateDebt(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDebtInput) => api.createDebt(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useRecordDebtPayment(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      debtId,
      input,
    }: {
      debtId: string;
      input: RecordDebtPaymentInput;
    }) => api.recordDebtPayment(clubId, debtId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}

export function useCompensationRules(
  clubId: string,
  query: ListCompensationRulesQuery = {},
  options?: Omit<
    UseQueryOptions<CompensationRulesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountFinanceApi();
  return useQuery({
    queryKey: accountFinanceKeys.compensationRules(clubId, query),
    queryFn: () => api.listCompensationRules(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useUpsertCompensationRule(clubId: string) {
  const api = useAccountFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertCompensationRuleInput) =>
      api.upsertCompensationRule(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountFinanceKeys.all });
    },
  });
}
