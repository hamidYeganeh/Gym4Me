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
  RescheduleBookingInput,
} from "./bookings.dto";
import {
  createClubBookingsApi,
  type ClubBookingsApi,
} from "./club-bookings.client";
import { clubBookingsKeys } from "./club-bookings.keys";

function useClubBookingsApi(): ClubBookingsApi {
  const client = useApiClient();
  return useMemo(() => createClubBookingsApi(client), [client]);
}

export function useClubBookingsList(
  clubId: string,
  query: BookingsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Booking>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useClubBookingsApi();
  return useQuery({
    queryKey: clubBookingsKeys.list(clubId, query),
    queryFn: () => api.list(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useClubBooking(
  clubId: string,
  id: string,
  options?: Omit<UseQueryOptions<Booking, Error>, "queryKey" | "queryFn">,
) {
  const api = useClubBookingsApi();
  return useQuery({
    queryKey: clubBookingsKeys.detail(clubId, id),
    queryFn: () => api.get(clubId, id),
    ...options,
    enabled: Boolean(clubId && id) && (options?.enabled ?? true),
  });
}

function useClubBookingMutation(
  action: (
    api: ClubBookingsApi,
  ) => (clubId: string, id: string) => Promise<Booking>,
) {
  const api = useClubBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, id }: { clubId: string; id: string }) =>
      action(api)(clubId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clubBookingsKeys.all });
    },
  });
}

export function useClubCheckInBooking() {
  return useClubBookingMutation((api) => api.checkIn.bind(api));
}

export function useClubCompleteBooking() {
  return useClubBookingMutation((api) => api.complete.bind(api));
}

export function useClubMarkNoShowBooking() {
  return useClubBookingMutation((api) => api.markNoShow.bind(api));
}

export function useClubCancelBooking() {
  const api = useClubBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clubId,
      id,
      input,
    }: {
      clubId: string;
      id: string;
      input?: CancelBookingInput;
    }) => api.cancel(clubId, id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clubBookingsKeys.all });
    },
  });
}

export function useClubRescheduleBooking() {
  const api = useClubBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clubId,
      id,
      input,
    }: {
      clubId: string;
      id: string;
      input: RescheduleBookingInput;
    }) => api.reschedule(clubId, id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clubBookingsKeys.all });
    },
  });
}
