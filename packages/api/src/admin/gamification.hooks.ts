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
import type { PointTransactionItem } from "../account/gamification.dto";
import {
  createAdminGamificationApi,
  type AdminGamificationApi,
} from "./gamification.client";
import type {
  AdjustPointsInput,
  AdjustPointsResult,
  AdminAchievement,
  AdminAchievementGrant,
  AdminPointRule,
  CreateAchievementInput,
  CreatePointRuleInput,
  GamificationOverview,
  GrantAchievementSubjectInput,
  ListAdminAchievementsQuery,
  ListAdminGrantsQuery,
  ListAdminPointRulesQuery,
  ListAdminPointTransactionsQuery,
  UpdateAchievementInput,
  UpdatePointRuleInput,
} from "./gamification.dto";
import { adminGamificationKeys } from "./gamification.keys";

function useAdminGamificationApi(): AdminGamificationApi {
  const client = useApiClient();
  return useMemo(() => createAdminGamificationApi(client), [client]);
}

function useInvalidateGamification() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: adminGamificationKeys.all });
}

// ── Achievements ────────────────────────────────────────────────────────────

export function useAdminAchievements(
  query: ListAdminAchievementsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminAchievement>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.achievements(query),
    queryFn: () => api.listAchievements(query),
    ...options,
  });
}

export function useAdminAchievement(
  id: string,
  options?: Omit<UseQueryOptions<AdminAchievement, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.achievement(id),
    queryFn: () => api.getAchievement(id),
    ...options,
  });
}

export function useCreateAdminAchievement(
  options?: UseMutationOptions<AdminAchievement, Error, CreateAchievementInput>,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createAchievement(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminAchievement(
  options?: UseMutationOptions<
    AdminAchievement,
    Error,
    { id: string; input: UpdateAchievementInput }
  >,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateAchievement(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAdminAchievement(
  options?: UseMutationOptions<{ archived: boolean }, Error, { id: string }>,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.archiveAchievement(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useGrantAdminAchievement(
  options?: UseMutationOptions<
    { granted: boolean },
    Error,
    { id: string; input: GrantAchievementSubjectInput }
  >,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.grantAchievement(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useRevokeAdminAchievement(
  options?: UseMutationOptions<
    { revoked: boolean },
    Error,
    { id: string; input: GrantAchievementSubjectInput }
  >,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.revokeAchievement(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminAchievementGrants(
  query: ListAdminGrantsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminAchievementGrant>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.grants(query),
    queryFn: () => api.listGrants(query),
    ...options,
  });
}

// ── Point rules ─────────────────────────────────────────────────────────────

export function useAdminPointRules(
  query: ListAdminPointRulesQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminPointRule>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.pointRules(query),
    queryFn: () => api.listPointRules(query),
    ...options,
  });
}

export function useAdminPointRule(
  id: string,
  options?: Omit<UseQueryOptions<AdminPointRule, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.pointRule(id),
    queryFn: () => api.getPointRule(id),
    ...options,
  });
}

export function useCreateAdminPointRule(
  options?: UseMutationOptions<AdminPointRule, Error, CreatePointRuleInput>,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createPointRule(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminPointRule(
  options?: UseMutationOptions<
    AdminPointRule,
    Error,
    { id: string; input: UpdatePointRuleInput }
  >,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updatePointRule(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useArchiveAdminPointRule(
  options?: UseMutationOptions<{ archived: boolean }, Error, { id: string }>,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.archivePointRule(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

// ── Ledger + analytics ──────────────────────────────────────────────────────

export function useAdminPointTransactions(
  query: ListAdminPointTransactionsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<PointTransactionItem>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.transactions(query),
    queryFn: () => api.listTransactions(query),
    ...options,
  });
}

export function useAdjustAdminPoints(
  options?: UseMutationOptions<AdjustPointsResult, Error, AdjustPointsInput>,
) {
  const api = useAdminGamificationApi();
  const invalidate = useInvalidateGamification();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.adjustPoints(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminGamificationOverview(
  options?: Omit<
    UseQueryOptions<GamificationOverview, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminGamificationApi();
  return useQuery({
    queryKey: adminGamificationKeys.overview(),
    queryFn: () => api.overview(),
    ...options,
  });
}
