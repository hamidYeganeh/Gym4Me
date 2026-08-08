import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createDiscoveryCoachesApi,
  type DiscoveryCoachesApi,
} from "./coaches.client";
import type {
  DiscoveryCoach,
  DiscoveryCoachesQuery,
} from "./coaches.dto";
import { discoveryCoachesKeys } from "./coaches.keys";

function useDiscoveryCoachesApi(): DiscoveryCoachesApi {
  const client = useApiClient();
  return useMemo(() => createDiscoveryCoachesApi(client), [client]);
}

export function useDiscoveryCoachesList(
  query: DiscoveryCoachesQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<DiscoveryCoach>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryCoachesApi();
  return useQuery({
    queryKey: discoveryCoachesKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useDiscoveryCoach(
  userId: string,
  options?: Omit<
    UseQueryOptions<DiscoveryCoach, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryCoachesApi();
  return useQuery({
    queryKey: discoveryCoachesKeys.detail(userId),
    queryFn: () => api.get(userId),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}
