import type { Booking, CoachSlot } from "@repo/api";
import type { ScheduleWorkoutIntensity } from "@repo/ui/cards/ScheduleWorkoutCard";
import { faDigits, formatTimeRangeFa } from "@/shared/lib/booking-view";
import {
  addDaysIso,
  formatJalaliDateShort,
  todayIso,
  weekdaySat0,
  weekRangeContaining,
} from "@/shared/lib/week-calendar";
import type {
  CoachCalendarDailyWorkout,
  CoachCalendarDay,
  CoachCalendarDayKey,
} from "./calendar-daily-data";
import { COACH_CALENDAR_TIME_SLOTS } from "./calendar-daily-data";
import type {
  CoachCalendarWeek,
  CoachCalendarWeekDay,
  CoachCalendarWeekDayKey,
  CoachCalendarWeeklyWorkout,
} from "./calendar-weekly-data";

const SHORT_DAY_KEYS: CoachCalendarDayKey[] = [
  "sat",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
];

const WEEK_DAY_KEYS: CoachCalendarWeekDayKey[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

function localDateOf(iso: string): string {
  const date = new Date(iso);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function hourOf(iso: string): number {
  return new Date(iso).getHours();
}

function durationLabel(startsAt: string, endsAt: string): string {
  const mins = Math.max(
    1,
    Math.round(
      (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000,
    ),
  );
  return faDigits(`${mins} دقیقه`);
}

function intensityForBooking(status: Booking["status"]): ScheduleWorkoutIntensity {
  if (status === "checked_in" || status === "completed") return "intense";
  if (status === "no_show" || status === "cancelled") return "normal";
  return "extreme";
}

function intensityForSlot(status: CoachSlot["status"]): ScheduleWorkoutIntensity {
  if (status === "booked") return "intense";
  return "normal";
}

function bookingTitle(booking: Booking): string {
  const first = booking.athlete?.name.first?.trim();
  const last = booking.athlete?.name.last?.trim();
  const name = [first, last].filter(Boolean).join(" ");
  if (name) return name;
  return booking.resource.title ?? "جلسه مربی";
}

function bookingCategory(booking: Booking): string {
  if (booking.consultationKind === "remote") return "آنلاین";
  if (booking.consultationKind === "in_person") return "حضوری";
  return "رزرو";
}

function emptyWeekDays(prefix: string): CoachCalendarWeekDay[] {
  return WEEK_DAY_KEYS.map((dayKey) => ({
    id: `${prefix}-${dayKey.slice(0, 3)}`,
    dayKey,
    workouts: [],
  }));
}

function toWeeklyWorkout(
  id: string,
  title: string,
  startsAt: string,
  endsAt: string,
  category: string,
  intensity: ScheduleWorkoutIntensity,
): CoachCalendarWeeklyWorkout {
  return {
    id,
    title,
    duration: durationLabel(startsAt, endsAt),
    category: `${category} · ${formatTimeRangeFa(startsAt, endsAt)}`,
    intensity,
  };
}

export function buildDailyDays(anchorIso = todayIso()): {
  days: CoachCalendarDay[];
  defaultDayId: string;
  range: { from: string; to: string };
} {
  const { from } = weekRangeContaining(anchorIso);
  const days: CoachCalendarDay[] = Array.from({ length: 8 }, (_, index) => {
    const dateIso = addDaysIso(from, index);
    const weekday = weekdaySat0(dateIso);
    return {
      id: dateIso,
      dayKey: SHORT_DAY_KEYS[weekday] ?? "sat",
      date: Number(dateIso.slice(-2)),
      hasWorkout: false,
    };
  });
  const defaultDayId =
    days.find((day) => day.id === anchorIso)?.id ?? days[0]?.id ?? anchorIso;
  return {
    days,
    defaultDayId,
    range: { from, to: addDaysIso(from, 7) },
  };
}

export function mapCalendarDailyWorkouts(input: {
  bookings: Booking[];
  slots: CoachSlot[];
  dayId: string;
}): CoachCalendarDailyWorkout[] {
  const { bookings, slots, dayId } = input;
  const fromBookings = bookings
    .filter((booking) => localDateOf(booking.startsAt) === dayId)
    .map((booking) => ({
      id: booking.id,
      hour: hourOf(booking.startsAt),
      title: bookingTitle(booking),
      duration: durationLabel(booking.startsAt, booking.endsAt),
      category: bookingCategory(booking),
      intensity: intensityForBooking(booking.status),
    }));

  const bookedSlotIds = new Set(
    bookings.map((booking) => booking.slotId).filter(Boolean),
  );
  const fromSlots = slots
    .filter(
      (slot) =>
        localDateOf(slot.startsAt) === dayId &&
        slot.status === "open" &&
        !bookedSlotIds.has(slot.id),
    )
    .map((slot) => ({
      id: slot.id,
      hour: hourOf(slot.startsAt),
      title: "نوبت آزاد",
      duration: durationLabel(slot.startsAt, slot.endsAt),
      category: slot.club?.name ?? "اسلات",
      intensity: intensityForSlot(slot.status),
    }));

  return [...fromBookings, ...fromSlots].sort((a, b) => a.hour - b.hour);
}

export function markDailyDaysWithWorkouts(
  days: CoachCalendarDay[],
  bookings: Booking[],
  slots: CoachSlot[],
): CoachCalendarDay[] {
  const busy = new Set<string>();
  for (const booking of bookings) busy.add(localDateOf(booking.startsAt));
  for (const slot of slots) {
    if (slot.status === "open" || slot.status === "booked") {
      busy.add(localDateOf(slot.startsAt));
    }
  }
  return days.map((day) => ({
    ...day,
    hasWorkout: busy.has(day.id),
  }));
}

export function dailyTimeSlots() {
  return COACH_CALENDAR_TIME_SLOTS;
}

export function buildWeeklyWeekStarts(anchorIso = todayIso()): {
  weekStarts: string[];
  defaultWeekIndex: number;
  range: { from: string; to: string };
} {
  const current = weekRangeContaining(anchorIso);
  const weekStarts = [-2, -1, 0, 1, 2].map((offset) =>
    addDaysIso(current.from, offset * 7),
  );
  return {
    weekStarts,
    defaultWeekIndex: 2,
    range: {
      from: weekStarts[0]!,
      to: addDaysIso(weekStarts[4]!, 6),
    },
  };
}

export function mapWeeklyWeeks(input: {
  weekStarts: string[];
  bookings: Booking[];
  slots: CoachSlot[];
}): CoachCalendarWeek[] {
  const { weekStarts, bookings, slots } = input;
  const bookedSlotIds = new Set(
    bookings.map((booking) => booking.slotId).filter(Boolean),
  );

  return weekStarts.map((from, index) => {
    const to = addDaysIso(from, 6);
    const days = emptyWeekDays(`w${index}`);

    const inRange = (iso: string) => {
      const dateIso = localDateOf(iso);
      return dateIso >= from && dateIso <= to;
    };

    for (const booking of bookings) {
      if (!inRange(booking.startsAt)) continue;
      const weekday = weekdaySat0(localDateOf(booking.startsAt));
      const day = days[weekday];
      if (!day) continue;
      day.workouts.push(
        toWeeklyWorkout(
          booking.id,
          bookingTitle(booking),
          booking.startsAt,
          booking.endsAt,
          bookingCategory(booking),
          intensityForBooking(booking.status),
        ),
      );
    }

    for (const slot of slots) {
      if (!inRange(slot.startsAt)) continue;
      if (slot.status !== "open" || bookedSlotIds.has(slot.id)) continue;
      const weekday = weekdaySat0(localDateOf(slot.startsAt));
      const day = days[weekday];
      if (!day) continue;
      day.workouts.push(
        toWeeklyWorkout(
          slot.id,
          "نوبت آزاد",
          slot.startsAt,
          slot.endsAt,
          slot.club?.name ?? "اسلات",
          intensityForSlot(slot.status),
        ),
      );
    }

    return {
      id: `week-${index}`,
      startLabel: formatJalaliDateShort(from),
      endLabel: formatJalaliDateShort(to),
      days,
    };
  });
}
