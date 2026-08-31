import type { Booking, BookingStatus } from "@repo/api";
import { formatJalaliDateTime, formatTomans } from "@/shared/lib/booking-view";

export type OwnerBookingView = {
  id: string;
  code: string;
  status: BookingStatus;
  athleteName: string;
  athletePhone: string;
  resourceTitle: string;
  resourceType: Booking["resource"]["type"];
  startsAt: string;
  startsAtLabel: string;
  attendeeCount: number;
  totalLabel: string;
  paid: boolean;
  source: "athlete" | "desk";
  holderType: "member" | "guest";
  note?: string;
};

export function mapOwnerBooking(booking: Booking): OwnerBookingView {
  const athleteName = [
    booking.athlete?.name.first,
    booking.athlete?.name.last,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: booking.id,
    code: booking.code,
    status: booking.status,
    athleteName: athleteName || "عضو باشگاه",
    athletePhone: booking.athlete?.phone ?? "—",
    resourceTitle: booking.resource.title ?? "سانس باشگاه",
    resourceType: booking.resource.type,
    startsAt: booking.startsAt,
    startsAtLabel: formatJalaliDateTime(booking.startsAt),
    attendeeCount: booking.attendeeCount,
    totalLabel: formatTomans(booking.pricing.total),
    paid: Boolean(booking.payment?.paidAt) || booking.pricing.total === 0,
    source: booking.source ?? "athlete",
    holderType: booking.holderType ?? "member",
    note: booking.intake.note ?? undefined,
  };
}

const now = Date.now();

export const OWNER_BOOKINGS_DEMO: OwnerBookingView[] = [
  {
    id: "demo-booking-1",
    code: "G4M-4821",
    status: "confirmed",
    athleteName: "سارا احمدی",
    athletePhone: "۰۹۱۲۱۲۳۴۵۶۷",
    resourceTitle: "کلاس پیلاتس",
    resourceType: "class",
    startsAt: new Date(now + 3_600_000).toISOString(),
    startsAtLabel: formatJalaliDateTime(new Date(now + 3_600_000).toISOString()),
    attendeeCount: 1,
    totalLabel: formatTomans(420_000),
    paid: true,
    source: "athlete",
    holderType: "member",
  },
  {
    id: "demo-booking-2",
    code: "G4M-4822",
    status: "checked_in",
    athleteName: "علی رضایی",
    athletePhone: "۰۹۱۹۴۴۴۵۵۶۶",
    resourceTitle: "سالن بدنسازی",
    resourceType: "session",
    startsAt: new Date(now - 1_800_000).toISOString(),
    startsAtLabel: formatJalaliDateTime(new Date(now - 1_800_000).toISOString()),
    attendeeCount: 1,
    totalLabel: formatTomans(300_000),
    paid: true,
    source: "desk",
    holderType: "guest",
    note: "رزرو تلفنی پذیرش",
  },
  {
    id: "demo-booking-3",
    code: "G4M-4798",
    status: "completed",
    athleteName: "نازنین کریمی",
    athletePhone: "۰۹۳۵۱۱۱۲۲۳۳",
    resourceTitle: "زمین اسکواش",
    resourceType: "space",
    startsAt: new Date(now - 86_400_000).toISOString(),
    startsAtLabel: formatJalaliDateTime(new Date(now - 86_400_000).toISOString()),
    attendeeCount: 2,
    totalLabel: formatTomans(760_000),
    paid: true,
    source: "athlete",
    holderType: "member",
  },
];
