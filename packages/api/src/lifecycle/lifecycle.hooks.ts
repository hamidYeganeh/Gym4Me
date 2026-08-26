import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountLifecycleApi,
  type AccountLifecycleApi,
} from "./lifecycle.client";
import type {
  AtRiskMembersResponse,
  ClubBroadcastList,
  CreateClubBroadcastInput,
  LifecycleJourneysResponse,
  LifecycleSegmentsResponse,
} from "./lifecycle.dto";
import { accountLifecycleKeys } from "./lifecycle.keys";

function useAccountLifecycleApi(): AccountLifecycleApi {
  const client = useApiClient();
  return useMemo(() => createAccountLifecycleApi(client), [client]);
}

export function useLifecycleSegments(
  clubId: string,
  options?: Omit<
    UseQueryOptions<LifecycleSegmentsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountLifecycleApi();
  return useQuery({
    queryKey: accountLifecycleKeys.segments(clubId),
    queryFn: () => api.listSegments(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useLifecycleAtRisk(
  clubId: string,
  options?: Omit<
    UseQueryOptions<AtRiskMembersResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountLifecycleApi();
  return useQuery({
    queryKey: accountLifecycleKeys.atRisk(clubId),
    queryFn: () => api.listAtRisk(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useLifecycleJourneys(
  clubId: string,
  options?: Omit<
    UseQueryOptions<LifecycleJourneysResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountLifecycleApi();
  return useQuery({
    queryKey: accountLifecycleKeys.journeys(clubId),
    queryFn: () => api.listJourneys(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useEnrollExpiringJourneys(clubId: string) {
  const api = useAccountLifecycleApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.enrollExpiring(clubId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountLifecycleKeys.all,
      });
    },
  });
}

export function useRunLifecycleJourneys(clubId: string) {
  const api = useAccountLifecycleApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.runJourneys(clubId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountLifecycleKeys.all,
      });
    },
  });
}

export function useClubBroadcasts(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ClubBroadcastList, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountLifecycleApi();
  return useQuery({
    queryKey: accountLifecycleKeys.broadcasts(clubId),
    queryFn: () => api.listBroadcasts(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useCreateClubBroadcast(clubId: string) {
  const api = useAccountLifecycleApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClubBroadcastInput) =>
      api.createBroadcast(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountLifecycleKeys.broadcasts(clubId),
      });
    },
  });
}
