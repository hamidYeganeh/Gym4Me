import type { AthleteBooking } from "../../lib/bookings-data";

export type AthleteBookingDetailScreenProps = {
  booking?: AthleteBooking;
};

export type BookingTimelineStepState = "done" | "current" | "pending";

export type BookingTimelineStepId =
  | "created"
  | "payment"
  | "confirm"
  | "attend"
  | "finish";
