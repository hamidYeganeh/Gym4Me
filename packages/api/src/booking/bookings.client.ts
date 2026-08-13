import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import { accountBookingsEndpoints as ep } from "./bookings.endpoint";
import type {
  Booking,
  BookingCancellationPreview,
  BookingsListQuery,
  CancelBookingInput,
  CancelBookingSeriesInput,
  CancelBookingSeriesResult,
  CreateBookingInput,
  CreateClubBookingInput,
  CreateClubBookingResult,
  PayBookingResult,
  RescheduleBookingInput,
  VerifyBookingPaymentInput,
} from "./bookings.dto";

/** Athlete-side bookings (requires athlete active role). */
export function createAccountBookingsApi(client: ApiClient) {
  return {
    /** Reserve a coach consultation slot. */
    create(input: CreateBookingInput) {
      return client.request<Booking>(ep.root, { method: "POST", body: input });
    },

    /** Reserve club occurrences (session / class / space). */
    createClub(input: CreateClubBookingInput) {
      return client.request<CreateClubBookingResult>(ep.club, {
        method: "POST",
        body: input,
      });
    },

    list(query: BookingsListQuery = {}) {
      return client.request<Paginated<Booking>>(ep.root, { query });
    },

    get(id: string) {
      return client.request<Booking>(ep.byId(id));
    },

    cancellationPreview(id: string) {
      return client.request<BookingCancellationPreview>(
        ep.cancellationPreview(id),
      );
    },

    pay(id: string, callbackUrl: string) {
      return client.request<PayBookingResult>(ep.pay(id), {
        method: "POST",
        body: { callbackUrl },
      });
    },

    verifyPayment(id: string, input: VerifyBookingPaymentInput) {
      return client.request<Booking>(ep.payVerify(id), {
        method: "POST",
        body: input,
      });
    },

    reschedule(id: string, input: RescheduleBookingInput) {
      return client.request<Booking>(ep.reschedule(id), {
        method: "POST",
        body: input,
      });
    },

    cancel(id: string, input: CancelBookingInput = {}) {
      return client.request<Booking>(ep.cancel(id), {
        method: "POST",
        body: input,
      });
    },

    /** Cancel a recurring series from a date. */
    cancelSeries(groupId: string, input: CancelBookingSeriesInput = {}) {
      return client.request<CancelBookingSeriesResult>(
        ep.seriesCancel(groupId),
        { method: "POST", body: input },
      );
    },
  };
}

export type AccountBookingsApi = ReturnType<typeof createAccountBookingsApi>;
