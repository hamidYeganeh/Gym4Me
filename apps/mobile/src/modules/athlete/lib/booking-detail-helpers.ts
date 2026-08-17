import type { BookingStatus } from "@/modules/athlete/lib/bookings-data";
import type { BookingTimelineStepId } from "@/modules/athlete/screens/AthleteBookingDetailScreen/AthleteBookingDetailScreen.types";

export const BOOKING_TIMELINE_STEPS: BookingTimelineStepId[] = [
  "created",
  "approval",
  "payment",
  "confirm",
  "attend",
  "finish",
];

export function getBookingTimelineStepIndex(status: BookingStatus): number {
  switch (status) {
    case "AWAITING_PAYMENT":
      return 2;
    case "PENDING":
      return 1;
    case "CONFIRMED":
      return 4;
    case "CHECKED_IN":
      return 5;
    case "COMPLETED":
    case "REFUND_REQUESTED":
    case "REFUNDED":
      return BOOKING_TIMELINE_STEPS.length;
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return 3;
    default:
      return 0;
  }
}
