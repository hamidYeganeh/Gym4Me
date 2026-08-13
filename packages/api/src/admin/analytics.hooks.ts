import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminAnalyticsApi,
  type AdminAnalyticsApi,
} from "./analytics.client";
import type { AdminAnalyticsOverview } from "./analytics.dto";
import { adminAnalyticsKeys } from "./analytics.keys";

function useAdminAnalyticsApi(): AdminAnalyticsApi {
  const client = useApiClient();
  return useMemo(() => createAdminAnalyticsApi(client), [client]);
}

export function useAdminAnalyticsOverview(
  options?: Omit<
    UseQueryOptions<AdminAnalyticsOverview, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminAnalyticsApi();
  return useQuery({
    queryKey: adminAnalyticsKeys.overview(),
    queryFn: () => api.overview(),
    ...options,
  });
}
