import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountCheckinApi,
  type AccountCheckinApi,
} from "./checkin.client";
import type {
  CheckIn,
  CheckInByBookingCodeInput,
  CheckInByMembershipInput,
  CheckInsPage,
  ListCheckInsQuery,
} from "./checkin.dto";
import { accountCheckinKeys } from "./checkin.keys";

function useAccountCheckinApi(): AccountCheckinApi {
  const client = useApiClient();
  return useMemo(() => createAccountCheckinApi(client), [client]);
}

export function useMyCheckIns(
  query: ListCheckInsQuery = {},
  options?: Omit<UseQueryOptions<CheckInsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCheckinApi();
  return useQuery({
    queryKey: accountCheckinKeys.mine(query),
    queryFn: () => api.listMine(query),
    ...options,
  });
}

export function useClubCheckIns(
  clubId: string,
  query: ListCheckInsQuery = {},
  options?: Omit<UseQueryOptions<CheckInsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCheckinApi();
  return useQuery({
    queryKey: accountCheckinKeys.club(clubId, query),
    queryFn: () => api.listClub(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useCheckInByMembership(clubId: string) {
  const api = useAccountCheckinApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckInByMembershipInput) =>
      api.checkInByMembership(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCheckinKeys.all,
      });
    },
  });
}

export function useCheckInByBookingCode(clubId: string) {
  const api = useAccountCheckinApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckInByBookingCodeInput) =>
      api.checkInByBookingCode(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCheckinKeys.all,
      });
    },
  });
}

export type { CheckIn };
