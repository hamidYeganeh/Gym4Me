import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
} from "./bookings.dto";
import {
  createCoachBookingsApi,
  type CoachBookingsApi,
} from "./coach-bookings.client";
import { coachBookingsKeys } from "./coach-bookings.keys";

function useCoachBookingsApi(): CoachBookingsApi {
  const client = useApiClient();
  return useMemo(() => createCoachBookingsApi(client), [client]);
}

export function useCoachBookingsList(
  query: BookingsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Booking>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useCoachBookingsApi();
  return useQuery({
    queryKey: coachBookingsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useCoachBooking(
  id: string,
  options?: Omit<UseQueryOptions<Booking, Error>, "queryKey" | "queryFn">,
) {
  const api = useCoachBookingsApi();
  return useQuery({
    queryKey: coachBookingsKeys.detail(id),
    queryFn: () => api.get(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

function useCoachBookingMutation(
  action: (api: CoachBookingsApi) => (id: string) => Promise<Booking>,
) {
  const api = useCoachBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => action(api)(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coachBookingsKeys.all });
    },
  });
}

export function useCoachCancelBooking() {
  const api = useCoachBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CancelBookingInput }) =>
      api.cancel(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coachBookingsKeys.all });
    },
  });
}

export function useCoachCheckInBooking() {
  return useCoachBookingMutation((api) => api.checkIn);
}

export function useCoachCompleteBooking() {
  return useCoachBookingMutation((api) => api.complete);
}

export function useCoachMarkNoShowBooking() {
  return useCoachBookingMutation((api) => api.markNoShow);
}
