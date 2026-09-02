"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { commerceApi } from "./api";
import type { BookingListParams } from "./types";

export const commerceKeys = {
  all: ["commerce"] as const,
  quote: (id: string) => ["commerce", "quote", id] as const,
  bookings: (scope: string, params: unknown) => ["commerce", "bookings", scope, params] as const,
  household: ["commerce", "household"] as const,
  wallet: ["commerce", "wallet"] as const,
  payments: ["commerce", "payments"] as const,
  invoices: ["commerce", "invoices"] as const,
  refunds: ["commerce", "refunds"] as const,
  payment: (id: string) => ["commerce", "payment", id] as const,
  cancellationPreview: (id: string) => ["commerce", "cancellation-preview", id] as const,
  cancellationPolicies: (scope: string, id: string) =>
    ["commerce", "cancellation-policies", scope, id] as const,
  waitlist: ["commerce", "waitlist"] as const,
};

export function useQuoteQuery(quoteId: string, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.quote(quoteId),
    queryFn: ({ signal }) => commerceApi.quote(client, quoteId, signal),
    enabled: Boolean(quoteId) && (options.enabled ?? true),
  });
}
export function useMyBookingsQuery(
  params: BookingListParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.bookings("me", params),
    queryFn: ({ signal }) => commerceApi.mine(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
export function useBranchBookingsQuery(
  branchId: string,
  params: BookingListParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.bookings(`branch:${branchId}`, params),
    queryFn: ({ signal }) => commerceApi.branch(client, branchId, params, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}
export function useAdminBookingsQuery(
  params: BookingListParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.bookings("admin", params),
    queryFn: ({ signal }) => commerceApi.admin(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
export function useHouseholdQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.household,
    queryFn: ({ signal }) => commerceApi.household(client, signal),
    enabled: options.enabled ?? true,
  });
}
export function useWalletQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.wallet,
    queryFn: ({ signal }) => commerceApi.wallet(client, signal),
    enabled: options.enabled ?? true,
  });
}
export function usePaymentsQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.payments,
    queryFn: ({ signal }) => commerceApi.payments(client, signal),
    enabled: options.enabled ?? true,
  });
}
export function useMyInvoicesQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.invoices,
    queryFn: ({ signal }) => commerceApi.invoices(client, signal),
    enabled: options.enabled ?? true,
  });
}
export function useMyRefundsQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.refunds,
    queryFn: ({ signal }) => commerceApi.refunds(client, signal),
    enabled: options.enabled ?? true,
  });
}
export function useMockPaymentQuery(paymentId: string, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.payment(paymentId),
    queryFn: ({ signal }) => commerceApi.mockPayment(client, paymentId, signal),
    enabled: Boolean(paymentId) && (options.enabled ?? true),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 5_000 : false),
  });
}
export function useCancellationPreviewQuery(
  bookingId: string,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.cancellationPreview(bookingId),
    queryFn: ({ signal }) => commerceApi.cancellationPreview(client, bookingId, signal),
    enabled: Boolean(bookingId) && (options.enabled ?? true),
    staleTime: 15_000,
  });
}
export function useCancellationPoliciesQuery(
  scope: "organizations" | "clubs",
  scopeId: string,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.cancellationPolicies(scope, scopeId),
    queryFn: ({ signal }) => commerceApi.cancellationPolicies(client, scope, scopeId, signal),
    enabled: Boolean(scopeId) && (options.enabled ?? true),
  });
}
export function useWaitlistQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: commerceKeys.waitlist,
    queryFn: ({ signal }) => commerceApi.waitlist(client, signal),
    enabled: options.enabled ?? true,
  });
}
