import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { ItemsResponse } from "../types";
import {
  createDiscoveryClubSlotsApi,
  type DiscoveryClubSlotsApi,
} from "./club-slots.client";
import type {
  ClubCalendarQuery,
  ClubCalendarResponse,
  ClubClass,
} from "./club-slots.dto";
import { discoveryClubSlotsKeys } from "./club-slots.keys";

function useDiscoveryClubSlotsApi(): DiscoveryClubSlotsApi {
  const client = useApiClient();
  return useMemo(() => createDiscoveryClubSlotsApi(client), [client]);
}

export function useClubCalendar(
  clubId: string,
  query: ClubCalendarQuery,
  options?: Omit<
    UseQueryOptions<ClubCalendarResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.calendar(clubId, query),
    queryFn: () => api.getCalendar(clubId, query),
    enabled:
      Boolean(clubId && query.from && query.to) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubSlotClasses(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<ClubClass>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.classes(clubId),
    queryFn: () => api.listClasses(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubClass(
  clubId: string,
  classId: string,
  options?: Omit<UseQueryOptions<ClubClass, Error>, "queryKey" | "queryFn">,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.class(clubId, classId),
    queryFn: () => api.getClass(clubId, classId),
    enabled: Boolean(clubId && classId) && (options?.enabled ?? true),
    ...options,
  });
}
