import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createClubOwnerClubsApi,
  type ClubOwnerClubsApi,
} from "./clubs.client";
import type {
  AccountClubReviewsQuery,
  AccountClubsListQuery,
  Club,
  ClubUserReview,
  CreateClubInput,
  SubmitClubReviewInput,
  UpdateClubInput,
} from "./clubs.dto";
import { accountClubsKeys } from "./clubs.keys";

function useAccountClubsApi(): ClubOwnerClubsApi {
  const client = useApiClient();
  return useMemo(() => createClubOwnerClubsApi(client), [client]);
}

export function useAccountClubsList(
  query: AccountClubsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountClubsApi();
  return useQuery({
    queryKey: accountClubsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAccountClub(
  clubId: string,
  options?: Omit<UseQueryOptions<Club, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountClubsApi();
  return useQuery({
    queryKey: accountClubsKeys.detail(clubId),
    queryFn: () => api.get(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAccountClubReviews(
  clubId: string,
  query: AccountClubReviewsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<ClubUserReview>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountClubsApi();
  return useQuery({
    queryKey: accountClubsKeys.reviews(clubId, query),
    queryFn: () => api.listReviews(clubId, query),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAccountClub(
  options?: UseMutationOptions<Club, Error, CreateClubInput>,
) {
  const api = useAccountClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.create(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: accountClubsKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAccountClub(
  options?: UseMutationOptions<
    Club,
    Error,
    { clubId: string; input: UpdateClubInput }
  >,
) {
  const api = useAccountClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.update(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubsKeys.detail(vars.clubId),
      });
      void queryClient.invalidateQueries({ queryKey: accountClubsKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useSubmitAccountClub(
  options?: UseMutationOptions<
    Club,
    Error,
    { clubId: string; input: SubmitClubReviewInput }
  >,
) {
  const api = useAccountClubsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ clubId, input }) => api.submit(clubId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountClubsKeys.detail(vars.clubId),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
