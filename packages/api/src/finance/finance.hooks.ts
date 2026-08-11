import {
  useQuery,
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
  Invoice,
  InvoicesPage,
  ListInvoicesQuery,
  OwnerFinanceAnalytics,
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
