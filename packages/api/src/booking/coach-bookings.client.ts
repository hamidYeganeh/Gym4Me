import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import { coachBookingsEndpoints as ep } from "./coach-bookings.endpoint";
import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
} from "./bookings.dto";

/** Coach-side bookings (requires coach active role). */
export function createCoachBookingsApi(client: ApiClient) {
  return {
    list(query: BookingsListQuery = {}) {
      return client.request<Paginated<Booking>>(ep.root, { query });
    },

    get(id: string) {
      return client.request<Booking>(ep.byId(id));
    },

    cancel(id: string, input: CancelBookingInput = {}) {
      return client.request<Booking>(ep.cancel(id), {
        method: "POST",
        body: input,
      });
    },

    checkIn(id: string) {
      return client.request<Booking>(ep.checkIn(id), { method: "POST" });
    },

    complete(id: string) {
      return client.request<Booking>(ep.complete(id), { method: "POST" });
    },

    markNoShow(id: string) {
      return client.request<Booking>(ep.noShow(id), { method: "POST" });
    },
  };
}

export type CoachBookingsApi = ReturnType<typeof createCoachBookingsApi>;
