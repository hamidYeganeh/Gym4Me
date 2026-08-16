import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createDiscoveryClassesApi,
  type DiscoveryClassesApi,
} from "./classes.client";
import type {
  DiscoveryClass,
  DiscoveryClassesQuery,
} from "./classes.dto";
import { discoveryClassesKeys } from "./classes.keys";

function useDiscoveryClassesApi(): DiscoveryClassesApi {
  const client = useApiClient();
  return useMemo(() => createDiscoveryClassesApi(client), [client]);
}

export function useDiscoveryClassesList(
  query: DiscoveryClassesQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<DiscoveryClass>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClassesApi();
  return useQuery({
    queryKey: discoveryClassesKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useDiscoveryClass(
  classId: string,
  options?: Omit<
    UseQueryOptions<DiscoveryClass, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClassesApi();
  return useQuery({
    queryKey: discoveryClassesKeys.detail(classId),
    queryFn: () => api.get(classId),
    enabled: Boolean(classId) && (options?.enabled ?? true),
    ...options,
  });
}
