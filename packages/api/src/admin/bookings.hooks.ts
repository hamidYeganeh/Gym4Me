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
  createAdminBookingsApi,
  type AdminBookingsApi,
} from "./bookings.client";
import type {
  AdminBookingsListQuery,
  Booking,
  CancelBookingInput,
  SettleBookingRefundInput,
} from "./bookings.dto";
import { adminBookingsKeys } from "./bookings.keys";

function useAdminBookingsApi(): AdminBookingsApi {
  const client = useApiClient();
  return useMemo(() => createAdminBookingsApi(client), [client]);
}

export function useAdminBookingsList(
  query: AdminBookingsListQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<Booking>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBookingsApi();
  return useQuery({
    queryKey: adminBookingsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminBooking(
  id: string,
  options?: Omit<UseQueryOptions<Booking, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminBookingsApi();
  return useQuery({
    queryKey: adminBookingsKeys.detail(id),
    queryFn: () => api.get(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAdminCancelBooking() {
  const api = useAdminBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CancelBookingInput }) =>
      api.cancel(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminBookingsKeys.all });
    },
  });
}

export function useAdminRefundBooking() {
  const api = useAdminBookingsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input?: SettleBookingRefundInput;
    }) => api.refund(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminBookingsKeys.all });
    },
  });
}
