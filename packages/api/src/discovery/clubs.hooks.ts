import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createDiscoveryClubsApi,
  type DiscoveryClubsApi,
} from "./clubs.client";
import type {
  Club,
  ClubUserReview,
  CreateDiscoveryReviewInput,
  DiscoveryClubReviewsQuery,
  DiscoveryClubsQuery,
} from "./clubs.dto";
import { discoveryClubsKeys } from "./clubs.keys";
import type { ItemsResponse, Paginated } from "../types";

function useDiscoveryClubsApi(): DiscoveryClubsApi {
  const client = useApiClient();
  return useMemo(() => createDiscoveryClubsApi(client), [client]);
}

export function useDiscoveryClubsList(
  query: DiscoveryClubsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useDiscoveryClub(
  clubId: string,
  options?: Omit<UseQueryOptions<Club, Error>, "queryKey" | "queryFn">,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.detail(clubId),
    queryFn: () => api.get(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubReviews(
  clubId: string,
  query: DiscoveryClubReviewsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<ClubUserReview>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.reviews(clubId, query),
    queryFn: () => api.listReviews(clubId, query),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubBranches(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.branches(clubId),
    queryFn: () => api.listBranches(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubClasses(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<{ classId: string }>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.classes(clubId),
    queryFn: () => api.listClasses(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubCoaches(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<{ coachId: string }>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubsApi();
  return useQuery({
    queryKey: discoveryClubsKeys.coaches(clubId),
    queryFn: () => api.listCoaches(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateDiscoveryClubReview(
  options?: UseMutationOptions<
    ClubUserReview,
    Error,
    { clubId: string; input: CreateDiscoveryReviewInput }
  >,
) {
  const api = useDiscoveryClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.createReview(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: discoveryClubsKeys.detail(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
