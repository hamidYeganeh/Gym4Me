import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountMembershipsApi,
  type AccountMembershipsApi,
} from "./memberships.client";
import type {
  CancelPlatformSubscriptionInput,
  ClubMembership,
  ListClubMembershipsQuery,
  ListMyMembershipsQuery,
  MembershipsPage,
  InitiatePlatformSubscriptionCheckoutInput,
  PlatformPlansResponse,
  PlatformSubscriptionsResponse,
  PreviewPlatformSubscriptionCheckoutInput,
  PlatformEntitlementSummary,
  SelfPurchaseMembershipInput,
  SubscribePlatformInput,
  VerifyPlatformSubscriptionCheckoutInput,
} from "./memberships.dto";
import { accountMembershipsKeys } from "./memberships.keys";

function useAccountMembershipsApi(): AccountMembershipsApi {
  const client = useApiClient();
  return useMemo(() => createAccountMembershipsApi(client), [client]);
}

export function useMyMemberships(
  query: ListMyMembershipsQuery = {},
  options?: Omit<
    UseQueryOptions<MembershipsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.mineList(query),
    queryFn: () => api.listMine(query),
    ...options,
  });
}

export function useMyMembership(
  id: string,
  options?: Omit<
    UseQueryOptions<ClubMembership, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.mineDetail(id),
    queryFn: () => api.getMine(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useClubMemberships(
  clubId: string,
  query: ListClubMembershipsQuery = {},
  options?: Omit<
    UseQueryOptions<MembershipsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.clubList(clubId, query),
    queryFn: () => api.listClubMemberships(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function usePurchaseMembership() {
  const api = useAccountMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SelfPurchaseMembershipInput) => api.purchase(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountMembershipsKeys.all,
      });
    },
  });
}

// ── Platform SaaS subscriptions ─────────────────────────────────────────────

export function usePlatformPlans(
  options?: Omit<
    UseQueryOptions<PlatformPlansResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.platformPlans(),
    queryFn: () => api.listPlatformPlans(),
    ...options,
  });
}

export function useMyPlatformSubscriptions(
  options?: Omit<
    UseQueryOptions<PlatformSubscriptionsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.platformSubscriptions(),
    queryFn: () => api.listPlatformSubscriptions(),
    ...options,
  });
}

export function usePlatformEntitlements(
  clubId?: string,
  options?: Omit<
    UseQueryOptions<PlatformEntitlementSummary, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountMembershipsApi();
  return useQuery({
    queryKey: accountMembershipsKeys.platformEntitlements(clubId),
    queryFn: () => api.getPlatformEntitlements(clubId),
    ...options,
  });
}

export function useSubscribePlatform() {
  const api = useAccountMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubscribePlatformInput) =>
      api.subscribePlatform(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountMembershipsKeys.all,
      });
    },
  });
}

export function useCancelPlatformSubscription() {
  const api = useAccountMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subscriptionId,
      input,
    }: {
      subscriptionId: string;
      input?: CancelPlatformSubscriptionInput;
    }) => api.cancelPlatformSubscription(subscriptionId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountMembershipsKeys.all,
      });
    },
  });
}

export function useInitiatePlatformSubscriptionCheckout() {
  const api = useAccountMembershipsApi();
  return useMutation({
    mutationFn: (input: InitiatePlatformSubscriptionCheckoutInput) =>
      api.initiatePlatformSubscriptionCheckout(input),
  });
}

export function usePreviewPlatformSubscriptionCheckout() {
  const api = useAccountMembershipsApi();
  return useMutation({
    mutationFn: (input: PreviewPlatformSubscriptionCheckoutInput) =>
      api.previewPlatformSubscriptionCheckout(input),
  });
}

export function useVerifyPlatformSubscriptionCheckout() {
  const api = useAccountMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checkoutId,
      input,
    }: {
      checkoutId: string;
      input: VerifyPlatformSubscriptionCheckoutInput;
    }) => api.verifyPlatformSubscriptionCheckout(checkoutId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountMembershipsKeys.all,
      });
    },
  });
}
