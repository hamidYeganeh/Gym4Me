import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountCalendarApi,
  type AccountCalendarApi,
} from "./calendar.client";
import type {
  CalendarBlocksPage,
  ListCalendarBlocksQuery,
  UpsertCalendarBlockInput,
} from "./calendar.dto";
import { accountCalendarKeys } from "./calendar.keys";

function useAccountCalendarApi(): AccountCalendarApi {
  const client = useApiClient();
  return useMemo(() => createAccountCalendarApi(client), [client]);
}

export function useClubCalendarBlocks(
  clubId: string,
  query: ListCalendarBlocksQuery = {},
  options?: Omit<
    UseQueryOptions<CalendarBlocksPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCalendarApi();
  return useQuery({
    queryKey: accountCalendarKeys.clubBlocks(clubId, query),
    queryFn: () => api.listClubBlocks(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useUpsertClubCalendarBlock(clubId: string) {
  const api = useAccountCalendarApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertCalendarBlockInput) =>
      api.upsertClubBlock(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCalendarKeys.all,
      });
    },
  });
}

export function useRemoveClubCalendarBlock(clubId: string) {
  const api = useAccountCalendarApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => api.removeClubBlock(clubId, blockId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCalendarKeys.all,
      });
    },
  });
}

export function useCoachCalendarBlocks(
  query: ListCalendarBlocksQuery = {},
  options?: Omit<
    UseQueryOptions<CalendarBlocksPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCalendarApi();
  return useQuery({
    queryKey: accountCalendarKeys.coachBlocks(query),
    queryFn: () => api.listCoachBlocks(query),
    ...options,
  });
}

export function useUpsertCoachCalendarBlock() {
  const api = useAccountCalendarApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertCalendarBlockInput) =>
      api.upsertCoachBlock(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCalendarKeys.all,
      });
    },
  });
}

export function useRemoveCoachCalendarBlock() {
  const api = useAccountCalendarApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => api.removeCoachBlock(blockId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCalendarKeys.all,
      });
    },
  });
}
