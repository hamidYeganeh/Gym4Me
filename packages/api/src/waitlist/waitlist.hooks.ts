import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountWaitlistApi,
  type AccountWaitlistApi,
} from "./waitlist.client";
import type {
  ClaimWaitlistInput,
  JoinWaitlistInput,
  ListWaitlistsQuery,
  OfferWaitlistInput,
  WaitlistsPage,
} from "./waitlist.dto";
import { accountWaitlistKeys } from "./waitlist.keys";

function useAccountWaitlistApi(): AccountWaitlistApi {
  const client = useApiClient();
  return useMemo(() => createAccountWaitlistApi(client), [client]);
}

export function useMyWaitlists(
  query: ListWaitlistsQuery = {},
  options?: Omit<
    UseQueryOptions<WaitlistsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountWaitlistApi();
  return useQuery({
    queryKey: accountWaitlistKeys.mine(query),
    queryFn: () => api.listMine(query),
    ...options,
  });
}

export function useClubWaitlists(
  clubId: string,
  query: ListWaitlistsQuery = {},
  options?: Omit<
    UseQueryOptions<WaitlistsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountWaitlistApi();
  return useQuery({
    queryKey: accountWaitlistKeys.club(clubId, query),
    queryFn: () => api.listClub(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useJoinWaitlist() {
  const api = useAccountWaitlistApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JoinWaitlistInput) => api.join(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountWaitlistKeys.all,
      });
    },
  });
}

export function useLeaveWaitlist() {
  const api = useAccountWaitlistApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (waitlistId: string) => api.leave(waitlistId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountWaitlistKeys.all,
      });
    },
  });
}

export function useClaimWaitlist(waitlistId: string) {
  const api = useAccountWaitlistApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClaimWaitlistInput) => api.claim(waitlistId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountWaitlistKeys.all,
      });
    },
  });
}

export function useOfferWaitlist(clubId: string, waitlistId: string) {
  const api = useAccountWaitlistApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferWaitlistInput = {}) =>
      api.offer(clubId, waitlistId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountWaitlistKeys.all,
      });
    },
  });
}
