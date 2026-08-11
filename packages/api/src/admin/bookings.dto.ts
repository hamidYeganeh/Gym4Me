import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
} from "../booking/bookings.dto";

export type AdminBookingsListQuery = BookingsListQuery & {
  athleteId?: string;
  coachUserId?: string;
  clubId?: string;
};

export type { Booking, CancelBookingInput };
