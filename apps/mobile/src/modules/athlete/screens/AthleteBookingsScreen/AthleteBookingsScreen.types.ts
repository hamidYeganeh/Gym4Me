import type { AthleteBooking } from "../../lib/bookings-data";

export type BookingsFilterId = "upcoming" | "past" | "cancelled";

export type AthleteBookingsScreenProps = {
  bookings: AthleteBooking[];
};
