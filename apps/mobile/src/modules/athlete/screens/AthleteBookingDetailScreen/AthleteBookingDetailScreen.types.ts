import type { Booking } from "@repo/api";
import type { AthleteBooking } from "../../lib/bookings-data";

export type AthleteBookingDetailScreenProps = {
  booking?: AthleteBooking;
  /** Provided for live API bookings so actions can refresh the view. */
  onBookingChange?: (booking: Booking) => void;
};

export type BookingTimelineStepState = "done" | "current" | "pending";

export type BookingTimelineStepId =
  | "created"
  | "payment"
  | "confirm"
  | "attend"
  | "finish";
