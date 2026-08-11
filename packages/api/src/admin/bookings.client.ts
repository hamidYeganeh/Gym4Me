import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import { adminBookingsEndpoints as ep } from "./bookings.endpoint";
import type {
  AdminBookingsListQuery,
  Booking,
  CancelBookingInput,
} from "./bookings.dto";

/** Admin booking ops: audits, disputes, refund settlement. */
export function createAdminBookingsApi(client: ApiClient) {
  return {
    list(query: AdminBookingsListQuery = {}) {
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

    refund(id: string) {
      return client.request<Booking>(ep.refund(id), { method: "POST" });
    },
  };
}

export type AdminBookingsApi = ReturnType<typeof createAdminBookingsApi>;
