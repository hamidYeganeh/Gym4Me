import type { Booking } from "@repo/api";
import {
  bookingStatusView,
  bookingUserName,
  faDigits,
  formatJalaliDateTime,
  formatJalaliFullDate,
  formatTimeRangeFa,
  formatTomans,
} from "@/shared/lib/booking-view";
import type { AthleteBooking } from "./bookings-data";

/** Copy the mapper needs but that lives in i18n (resolved by the calling gate). */
export type AthleteBookingCopy = {
  inPersonTitle: string;
  remoteTitle: string;
  remoteLocation: string;
};

const CLUB_RESOURCE_TITLE_FA: Record<string, string> = {
  session: "سانس باشگاه",
  class: "کلاس باشگاه",
  space: "رزرو فضا / سالن",
};

/** Radio options offered when an athlete cancels a booking (RefItem slugs). */
export const BOOKING_CANCEL_REASON_KEYS = [
  "schedule_conflict",
  "personal",
  "coach_changed",
  "price",
  "other",
] as const;

export type BookingCancelReasonKey =
  (typeof BOOKING_CANCEL_REASON_KEYS)[number];

export function mapApiBookingToAthleteBooking(
  booking: Booking,
  copy: AthleteBookingCopy,
): AthleteBooking {
  const isCoachBooking = booking.resource.type === "coach";
  const isRemote = booking.consultationKind === "remote";
  const clubLabel = booking.club?.name ?? "";
  const inPersonLocation =
    [booking.club?.name, booking.club?.address].filter(Boolean).join("، ") ||
    "—";
  const location =
    isCoachBooking && isRemote ? copy.remoteLocation : inPersonLocation;

  const title = isCoachBooking
    ? isRemote
      ? copy.remoteTitle
      : copy.inPersonTitle
    : (booking.resource.title ??
      CLUB_RESOURCE_TITLE_FA[booking.resource.type] ??
      "رزرو");

  return {
    id: booking.id,
    kind: booking.resource.type,
    title,
    clubName: clubLabel || copy.remoteLocation,
    coach: booking.coach
      ? {
          name: bookingUserName(booking.coach),
          verification: "verified",
        }
      : undefined,
    datetimeLabel: formatJalaliDateTime(booking.startsAt),
    dateLabel: formatJalaliFullDate(booking.startsAt),
    timeLabel: formatTimeRangeFa(booking.startsAt, booking.endsAt),
    locationLabel: location,
    priceLabel: formatTomans(booking.pricing.total),
    status: bookingStatusView(booking.status),
    checkInCode: faDigits(booking.code),
    api: {
      resourceType: booking.resource.type,
      coachUserId: booking.coachUserId,
      consultationKind: booking.consultationKind,
      occurrenceDate: booking.occurrence?.date ?? null,
      recurringGroupId: booking.recurringGroupId,
    },
  };
}
