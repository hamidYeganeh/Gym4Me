import { useMemo } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useApiClient } from "../react";
import {
  createDiscoveryCoachSlotsApi,
  type DiscoveryCoachSlotsApi,
} from "./coach-slots.client";
import type {
  CoachSlotsRangeQuery,
  CoachSlotsResponse,
} from "./coach-slots.dto";
import { discoveryCoachSlotsKeys } from "./coach-slots.keys";

function useDiscoveryCoachSlotsApi(): DiscoveryCoachSlotsApi {
  const client = useApiClient();
  return useMemo(() => createDiscoveryCoachSlotsApi(client), [client]);
}

export function useDiscoveryCoachSlots(
  userId: string,
  query: CoachSlotsRangeQuery,
  options?: Omit<
    UseQueryOptions<CoachSlotsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryCoachSlotsApi();
  return useQuery({
    queryKey: discoveryCoachSlotsKeys.list(userId, query),
    queryFn: () => api.list(userId, query),
    ...options,
    enabled: Boolean(userId) && (options?.enabled ?? true),
  });
}
