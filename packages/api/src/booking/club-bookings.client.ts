import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
} from "./bookings.dto";
import { clubBookingsEndpoints as ep } from "./club-bookings.endpoint";

/** Venue-side booking ops (requires club_owner active role). */
export function createClubBookingsApi(client: ApiClient) {
  return {
    list(clubId: string, query: BookingsListQuery = {}) {
      return client.request<Paginated<Booking>>(ep.root(clubId), { query });
    },

    get(clubId: string, id: string) {
      return client.request<Booking>(ep.byId(clubId, id));
    },

    checkIn(clubId: string, id: string) {
      return client.request<Booking>(ep.checkIn(clubId, id), {
        method: "POST",
      });
    },

    complete(clubId: string, id: string) {
      return client.request<Booking>(ep.complete(clubId, id), {
        method: "POST",
      });
    },

    markNoShow(clubId: string, id: string) {
      return client.request<Booking>(ep.noShow(clubId, id), {
        method: "POST",
      });
    },

    cancel(clubId: string, id: string, input: CancelBookingInput = {}) {
      return client.request<Booking>(ep.cancel(clubId, id), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type ClubBookingsApi = ReturnType<typeof createClubBookingsApi>;
