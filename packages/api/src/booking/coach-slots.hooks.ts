import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createCoachSlotsApi,
  type CoachSlotsApi,
} from "./coach-slots.client";
import type {
  CoachSlotClub,
  CoachSlotsListResponse,
  CoachSlotsRangeQuery,
  CreateCoachSlotsInput,
} from "./coach-slots.dto";
import { coachSlotsKeys } from "./coach-slots.keys";

function useCoachSlotsApi(): CoachSlotsApi {
  const client = useApiClient();
  return useMemo(() => createCoachSlotsApi(client), [client]);
}

export function useCoachSlotsList(
  query: CoachSlotsRangeQuery,
  options?: Omit<
    UseQueryOptions<CoachSlotsListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useCoachSlotsApi();
  return useQuery({
    queryKey: coachSlotsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useCoachSlotClubs(
  options?: Omit<UseQueryOptions<CoachSlotClub[], Error>, "queryKey" | "queryFn">,
) {
  const api = useCoachSlotsApi();
  return useQuery({
    queryKey: coachSlotsKeys.clubs(),
    queryFn: () => api.clubs(),
    ...options,
  });
}

export function useCreateCoachSlots() {
  const api = useCoachSlotsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCoachSlotsInput) => api.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coachSlotsKeys.all });
    },
  });
}

export function useDeleteCoachSlot() {
  const api = useCoachSlotsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => api.remove(slotId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coachSlotsKeys.all });
    },
  });
}
