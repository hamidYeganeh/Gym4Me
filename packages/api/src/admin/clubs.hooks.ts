import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { ItemsResponse, Paginated } from "../types";
import { createAdminClubsApi, type AdminClubsApi } from "./clubs.client";
import type {
  AdminClubReviewsQuery,
  AdminClubsListQuery,
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  ListClubReviewsQuery,
  ReviewVerificationInput,
  UpdateClubInput,
} from "./clubs.dto";
import { adminClubsKeys } from "./clubs.keys";

function useAdminClubsApi(): AdminClubsApi {
  const client = useApiClient();
  return useMemo(() => createAdminClubsApi(client), [client]);
}

export function useAdminClubsList(
  query: AdminClubsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubsApi();
  return useQuery({
    queryKey: adminClubsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminClub(
  clubId: string,
  options?: Omit<UseQueryOptions<Club, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminClubsApi();
  return useQuery({
    queryKey: adminClubsKeys.detail(clubId),
    queryFn: () => api.get(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAdminClubVerificationList(
  query: ListClubReviewsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubsApi();
  return useQuery({
    queryKey: adminClubsKeys.verificationList(query),
    queryFn: () => api.listVerification(query),
    ...options,
  });
}

export function useAdminClubReviews(
  clubId: string,
  query: AdminClubReviewsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<ClubUserReview>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubsApi();
  return useQuery({
    queryKey: adminClubsKeys.reviews(clubId, query),
    queryFn: () => api.listReviews(clubId, query),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAdminClubBranches(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminClubsApi();
  return useQuery({
    queryKey: adminClubsKeys.branches(clubId),
    queryFn: () => api.listBranches(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminClub(
  options?: UseMutationOptions<Club, Error, AdminCreateClubInput>,
) {
  const api = useAdminClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.create(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: adminClubsKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminClub(
  options?: UseMutationOptions<
    Club,
    Error,
    { clubId: string; input: UpdateClubInput }
  >,
) {
  const api = useAdminClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.update(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubsKeys.detail(vars.clubId),
      });
      void queryClient.invalidateQueries({ queryKey: adminClubsKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useRemoveAdminClub(
  options?: UseMutationOptions<{ success: true }, Error, string>,
) {
  const api = useAdminClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (clubId) => api.remove(clubId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: adminClubsKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useReviewAdminClubLifecycle(
  options?: UseMutationOptions<
    Club,
    Error,
    { clubId: string; input: ReviewVerificationInput }
  >,
) {
  const api = useAdminClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.reviewLifecycle(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubsKeys.detail(vars.clubId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminClubsKeys.verificationLists(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useModerateAdminClubReview(
  options?: UseMutationOptions<
    ClubUserReview,
    Error,
    { clubId: string; reviewId: string; status: ClubUserReview["status"] }
  >,
) {
  const api = useAdminClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, reviewId, status }) =>
      api.moderateReview(clubId, reviewId, status),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminClubsKeys.detail(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
