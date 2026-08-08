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
  createAnalyticsApi,
  type AnalyticsApi,
} from "./analytics.client";
import type {
  CaptureAttributionInput,
  UserAttribution,
} from "./analytics.dto";
import { analyticsKeys } from "./analytics.keys";

function useAnalyticsApi(): AnalyticsApi {
  const client = useApiClient();
  return useMemo(() => createAnalyticsApi(client), [client]);
}

export function useAttribution(
  options?: Omit<
    UseQueryOptions<UserAttribution, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAnalyticsApi();
  return useQuery({
    queryKey: analyticsKeys.attribution(),
    queryFn: () => api.getAttribution(),
    ...options,
  });
}

export function useCaptureAttribution(
  options?: UseMutationOptions<
    UserAttribution,
    Error,
    CaptureAttributionInput
  >,
) {
  const api = useAnalyticsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.captureAttribution(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: analyticsKeys.attribution(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
