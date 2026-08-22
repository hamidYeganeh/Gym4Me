import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { Paginated } from "../types";
import { useApiClient } from "../react";
import {
  createAppConfigApi,
  type AppConfigApi,
  type ListAppConfigQuery,
} from "./app-config.client";
import type {
  AppBootstrap,
  FeatureFlag,
  FetchBootstrapQuery,
  MobileReleasePolicy,
  UpsertFeatureFlagInput,
  UpsertReleasePolicyInput,
} from "./app-config.dto";
import { appConfigKeys } from "./app-config.keys";

function useAppConfigApi(): AppConfigApi {
  const client = useApiClient();
  return useMemo(() => createAppConfigApi(client), [client]);
}

export function useAppBootstrap(
  query: FetchBootstrapQuery,
  options?: Omit<
    UseQueryOptions<AppBootstrap, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAppConfigApi();
  return useQuery({
    queryKey: appConfigKeys.bootstrap(query),
    queryFn: () => api.fetchBootstrap(query),
    ...options,
  });
}

export function useFeatureFlags(
  query: ListAppConfigQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<FeatureFlag>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAppConfigApi();
  return useQuery({
    queryKey: appConfigKeys.featureFlags(query),
    queryFn: () => api.listFeatureFlags(query),
    ...options,
  });
}

export function useReleasePolicies(
  query: ListAppConfigQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<MobileReleasePolicy>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAppConfigApi();
  return useQuery({
    queryKey: appConfigKeys.releasePolicies(query),
    queryFn: () => api.listReleasePolicies(query),
    ...options,
  });
}

export function useUpsertFeatureFlag() {
  const api = useAppConfigApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      input,
    }: {
      key: string;
      input: UpsertFeatureFlagInput;
    }) => api.upsertFeatureFlag(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: appConfigKeys.featureFlags(),
      });
    },
  });
}

export function useUpsertReleasePolicy() {
  const api = useAppConfigApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertReleasePolicyInput) =>
      api.upsertReleasePolicy(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: appConfigKeys.releasePolicies(),
      });
    },
  });
}
