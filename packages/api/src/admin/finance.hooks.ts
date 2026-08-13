import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminFinanceApi,
  type AdminFinanceApi,
} from "./finance.client";
import type {
  AdminLedgerPage,
  CreatePayoutInput,
  DraftPeriodPayoutInput,
  ListAdminLedgerQuery,
  ListAdminPaymentsQuery,
  ListPayoutsQuery,
  PaymentsPage,
  PaymentWithLedger,
  PayoutsPage,
  ResolvePayoutDisputeInput,
  SettlePayoutInput,
} from "./finance.dto";
import { adminFinanceKeys } from "./finance.keys";

function useAdminFinanceApi(): AdminFinanceApi {
  const client = useApiClient();
  return useMemo(() => createAdminFinanceApi(client), [client]);
}

export function useAdminLedgerList(
  query: ListAdminLedgerQuery = {},
  options?: Omit<
    UseQueryOptions<AdminLedgerPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminFinanceApi();
  return useQuery({
    queryKey: adminFinanceKeys.ledger(query),
    queryFn: () => api.listLedger(query),
    ...options,
  });
}

export function useAdminPayments(
  query: ListAdminPaymentsQuery = {},
  options?: Omit<UseQueryOptions<PaymentsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminFinanceApi();
  return useQuery({
    queryKey: adminFinanceKeys.payments(query),
    queryFn: () => api.listPayments(query),
    ...options,
  });
}

export function useAdminPayment(
  id: string,
  options?: Omit<
    UseQueryOptions<PaymentWithLedger, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminFinanceApi();
  return useQuery({
    queryKey: adminFinanceKeys.payment(id),
    queryFn: () => api.getPayment(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAdminPayouts(
  query: ListPayoutsQuery & { clubId?: string } = {},
  options?: Omit<UseQueryOptions<PayoutsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminFinanceApi();
  return useQuery({
    queryKey: adminFinanceKeys.payouts(query),
    queryFn: () => api.listPayouts(query),
    ...options,
  });
}

export function useAdminCreatePayout() {
  const api = useAdminFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePayoutInput & { clubId?: string }) =>
      api.createPayout(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFinanceKeys.all });
    },
  });
}

export function useAdminDraftPeriodPayout() {
  const api = useAdminFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DraftPeriodPayoutInput & { clubId?: string }) =>
      api.draftPeriodPayout(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFinanceKeys.all });
    },
  });
}

export function useAdminSettlePayout() {
  const api = useAdminFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: SettlePayoutInput }) =>
      api.settlePayout(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFinanceKeys.all });
    },
  });
}

export function useAdminOpenPayoutDispute() {
  const api = useAdminFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.openPayoutDispute(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFinanceKeys.all });
    },
  });
}

export function useAdminResolvePayoutDispute() {
  const api = useAdminFinanceApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ResolvePayoutDisputeInput;
    }) => api.resolvePayoutDispute(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminFinanceKeys.all });
    },
  });
}
