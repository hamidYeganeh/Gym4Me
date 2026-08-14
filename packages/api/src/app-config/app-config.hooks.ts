import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAppConfigApi,
  type AppConfigApi,
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
  options?: Omit<
    UseQueryOptions<FeatureFlag[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAppConfigApi();
  return useQuery({
    queryKey: appConfigKeys.featureFlags(),
    queryFn: () => api.listFeatureFlags(),
    ...options,
  });
}

export function useReleasePolicies(
  options?: Omit<
    UseQueryOptions<MobileReleasePolicy[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAppConfigApi();
  return useQuery({
    queryKey: appConfigKeys.releasePolicies(),
    queryFn: () => api.listReleasePolicies(),
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
