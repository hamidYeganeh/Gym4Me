import {
  CalendarDate,
  GregorianCalendar,
  PersianCalendar,
  toCalendar,
} from "@internationalized/date";
import { toGregorian, toJalali } from "@/shared/lib/jalali";
import type { JalaliCalendarValue } from "./JalaliCalendar.types";

export const JALALI_CALENDAR_LOCALE = "fa-IR-u-ca-persian";

const PERSIAN_CALENDAR = new PersianCalendar();
const GREGORIAN_CALENDAR = new GregorianCalendar();

export function jalaliValueToCalendarDate(
  value: JalaliCalendarValue,
): CalendarDate {
  return new CalendarDate(
    PERSIAN_CALENDAR,
    value.year,
    value.month,
    value.day,
  );
}

export function calendarDateToJalaliValue(date: CalendarDate): JalaliCalendarValue {
  const persianDate = toCalendar(date, PERSIAN_CALENDAR);
  return {
    year: persianDate.year,
    month: persianDate.month,
    day: persianDate.day,
  };
}

/** Gregorian ISO `YYYY-MM-DD` from a Jalali calendar selection. */
export function jalaliValueToIso(value: JalaliCalendarValue): string {
  const gregorian = toCalendar(jalaliValueToCalendarDate(value), GREGORIAN_CALENDAR);
  return `${String(gregorian.year).padStart(4, "0")}-${String(gregorian.month).padStart(2, "0")}-${String(gregorian.day).padStart(2, "0")}`;
}

export function toJalaliCalendarDate(
  value: JalaliCalendarValue | string | Date | null | undefined,
): CalendarDate | undefined {
  if (value == null) return undefined;

  if (
    typeof value === "object" &&
    !(value instanceof Date) &&
    "year" in value &&
    "month" in value &&
    "day" in value
  ) {
    return jalaliValueToCalendarDate(value);
  }

  if (value instanceof Date) {
    const { jy, jm, jd } = toJalali(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
    );
    return new CalendarDate(PERSIAN_CALENDAR, jy, jm, jd);
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) {
    const { jy, jm, jd } = toJalali(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
    );
    return new CalendarDate(PERSIAN_CALENDAR, jy, jm, jd);
  }

  return undefined;
}
