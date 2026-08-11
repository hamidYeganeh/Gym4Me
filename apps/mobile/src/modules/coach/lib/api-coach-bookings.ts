import type { Booking } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { mediaFileUrl } from "@/shared/lib/api";
import {
  bookingStatusView,
  bookingUserName,
  faDigits,
  formatJalaliFullDate,
  formatTimeRangeFa,
  formatTomans,
} from "@/shared/lib/booking-view";
import type {
  CoachBookingAction,
  CoachBookingRequest,
} from "./coach-bookings-data";

export type CoachBookingCopy = {
  inPersonType: string;
  remoteType: string;
};

function actionsFor(booking: Booking): CoachBookingAction[] {
  const isPast = new Date(booking.startsAt).getTime() < Date.now();
  switch (booking.status) {
    case "confirmed":
      return isPast ? ["checkIn", "noShow"] : ["checkIn", "cancel"];
    case "checked_in":
      return ["complete"];
    case "pending":
    case "awaiting_payment":
      return ["cancel"];
    default:
      return [];
  }
}

export function mapApiBookingToCoachRequest(
  booking: Booking,
  copy: CoachBookingCopy,
): CoachBookingRequest {
  return {
    id: booking.id,
    clientName: booking.athlete ? bookingUserName(booking.athlete) : "—",
    avatar:
      mediaFileUrl(booking.athlete?.avatar.mediaId) ?? PLACEHOLDER_IMAGE,
    typeLabel:
      booking.consultationKind === "remote"
        ? copy.remoteType
        : copy.inPersonType,
    dateLabel: formatJalaliFullDate(booking.startsAt),
    timeLabel: formatTimeRangeFa(booking.startsAt, booking.endsAt),
    priceLabel: formatTomans(booking.pricing.total),
    status: bookingStatusView(booking.status),
    checkInCode: faDigits(booking.code),
    api: { actions: actionsFor(booking) },
  };
}
