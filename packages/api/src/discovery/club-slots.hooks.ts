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
  ClubSlot,
  ClubSpace,
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

export function useDiscoveryClubSpaces(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<ClubSpace>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.spaces(clubId),
    queryFn: () => api.listSpaces(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubSpace(
  clubId: string,
  spaceId: string,
  options?: Omit<UseQueryOptions<ClubSpace, Error>, "queryKey" | "queryFn">,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.space(clubId, spaceId),
    queryFn: () => api.getSpace(clubId, spaceId),
    enabled: Boolean(clubId && spaceId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubSlots(
  clubId: string,
  options?: Omit<
    UseQueryOptions<ItemsResponse<ClubSlot>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.slots(clubId),
    queryFn: () => api.listSlots(clubId),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useDiscoveryClubSlot(
  clubId: string,
  slotId: string,
  options?: Omit<UseQueryOptions<ClubSlot, Error>, "queryKey" | "queryFn">,
) {
  const api = useDiscoveryClubSlotsApi();
  return useQuery({
    queryKey: discoveryClubSlotsKeys.slot(clubId, slotId),
    queryFn: () => api.getSlot(clubId, slotId),
    enabled: Boolean(clubId && slotId) && (options?.enabled ?? true),
    ...options,
  });
}
