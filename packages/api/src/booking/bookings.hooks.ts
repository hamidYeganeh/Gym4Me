import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createAccountBookingsApi,
  type AccountBookingsApi,
} from "./bookings.client";
import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
  CancelBookingSeriesInput,
  CreateBookingInput,
  CreateClubBookingInput,
  RescheduleBookingInput,
  VerifyBookingPaymentInput,
} from "./bookings.dto";
import { accountBookingsKeys } from "./bookings.keys";

function useAccountBookingsApi(): AccountBookingsApi {
  const client = useApiClient();
  return useMemo(() => createAccountBookingsApi(client), [client]);
}

export function useAccountBookingsList(
  query: BookingsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Booking>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountBookingsApi();
  return useQuery({
    queryKey: accountBookingsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAccountBooking(
  id: string,
  options?: Omit<UseQueryOptions<Booking, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountBookingsApi();
  return useQuery({
    queryKey: accountBookingsKeys.detail(id),
    queryFn: () => api.get(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useCreateBooking() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}

export function useCreateClubBooking() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClubBookingInput) => api.createClub(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}

export function useCancelBookingSeries() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input?: CancelBookingSeriesInput;
    }) => api.cancelSeries(groupId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}

export function useVerifyBookingPayment() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: VerifyBookingPaymentInput;
    }) => api.verifyPayment(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}

export function useRescheduleBooking() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleBookingInput }) =>
      api.reschedule(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}

export function useCancelBooking() {
  const api = useAccountBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CancelBookingInput }) =>
      api.cancel(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountBookingsKeys.all });
    },
  });
}
