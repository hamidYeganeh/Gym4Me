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
import type { Club } from "../account/clubs.dto";
import {
  createAdminVerificationApi,
  type AdminVerificationApi,
} from "./verification.client";
import type {
  CoachVerificationItem,
  ListClubReviewsQuery,
  ListCoachVerificationsQuery,
  ReviewCoachResponse,
  ReviewVerificationInput,
} from "./verification.dto";
import { adminVerificationKeys } from "./verification.keys";

function useAdminVerificationApi(): AdminVerificationApi {
  const client = useApiClient();
  return useMemo(() => createAdminVerificationApi(client), [client]);
}

export function useAdminCoachVerificationsList(
  query: ListCoachVerificationsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<CoachVerificationItem>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminVerificationApi();
  return useQuery({
    queryKey: adminVerificationKeys.coachList(query),
    queryFn: () => api.listCoachVerifications(query),
    ...options,
  });
}

export function useReviewAdminCoach(
  options?: UseMutationOptions<
    ReviewCoachResponse,
    Error,
    { userId: string; input: ReviewVerificationInput }
  >,
) {
  const api = useAdminVerificationApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.reviewCoach(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminVerificationKeys.coachLists(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminClubReviewsList(
  query: ListClubReviewsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Club>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminVerificationApi();
  return useQuery({
    queryKey: adminVerificationKeys.clubList(query),
    queryFn: () => api.listClubReviews(query),
    ...options,
  });
}

export function useReviewAdminClub(
  options?: UseMutationOptions<
    Club,
    Error,
    { id: string; input: ReviewVerificationInput }
  >,
) {
  const api = useAdminVerificationApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.reviewClub(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminVerificationKeys.clubLists(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
