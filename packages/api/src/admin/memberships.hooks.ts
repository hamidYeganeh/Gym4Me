import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminMembershipsApi,
  type AdminMembershipsApi,
} from "./memberships.client";
import type {
  AdminPlatformPlansPage,
  AdminPlatformSubscriptionsPage,
  CreatePlatformPlanInput,
  ListAdminPlatformPlansQuery,
  ListAdminPlatformSubscriptionsQuery,
  PlatformPlan,
  UpdatePlatformPlanInput,
} from "./memberships.dto";
import { adminMembershipsKeys } from "./memberships.keys";

function useAdminMembershipsApi(): AdminMembershipsApi {
  const client = useApiClient();
  return useMemo(() => createAdminMembershipsApi(client), [client]);
}

export function useAdminPlatformPlans(
  query: ListAdminPlatformPlansQuery = {},
  options?: Omit<
    UseQueryOptions<AdminPlatformPlansPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminMembershipsApi();
  return useQuery({
    queryKey: adminMembershipsKeys.platformPlans(query),
    queryFn: () => api.listPlatformPlans(query),
    ...options,
  });
}

export function useAdminPlatformPlan(
  planId: string,
  options?: Omit<UseQueryOptions<PlatformPlan, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminMembershipsApi();
  return useQuery({
    queryKey: adminMembershipsKeys.platformPlan(planId),
    queryFn: () => api.getPlatformPlan(planId),
    ...options,
    enabled: Boolean(planId) && (options?.enabled ?? true),
  });
}

export function useCreateAdminPlatformPlan() {
  const api = useAdminMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformPlanInput) =>
      api.createPlatformPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminMembershipsKeys.all,
      });
    },
  });
}

export function useUpdateAdminPlatformPlan() {
  const api = useAdminMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      input,
    }: {
      planId: string;
      input: UpdatePlatformPlanInput;
    }) => api.updatePlatformPlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminMembershipsKeys.all,
      });
    },
  });
}

export function useArchiveAdminPlatformPlan() {
  const api = useAdminMembershipsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => api.archivePlatformPlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminMembershipsKeys.all,
      });
    },
  });
}

export function useAdminPlatformSubscriptions(
  query: ListAdminPlatformSubscriptionsQuery = {},
  options?: Omit<
    UseQueryOptions<AdminPlatformSubscriptionsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminMembershipsApi();
  return useQuery({
    queryKey: adminMembershipsKeys.platformSubscriptions(query),
    queryFn: () => api.listPlatformSubscriptions(query),
    ...options,
  });
}
