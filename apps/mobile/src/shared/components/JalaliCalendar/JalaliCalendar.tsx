"use client";

import { Calendar, DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { jalaliCalendarVariants } from "./JalaliCalendar.styles";
import type {
  JalaliCalendarProps,
  JalaliCalendarValue,
} from "./JalaliCalendar.types";

function isJalaliValue(
  value: JalaliCalendarValue | string | Date,
): value is JalaliCalendarValue {
  return (
    typeof value === "object" &&
    !(value instanceof Date) &&
    "year" in value &&
    "month" in value &&
    "day" in value
  );
}

function toDateObject(
  value: JalaliCalendarValue | string | Date | null | undefined,
): DateObject | undefined {
  if (value == null) return undefined;

  if (isJalaliValue(value)) {
    return new DateObject({
      year: value.year,
      month: value.month,
      day: value.day,
      calendar: persian,
      locale: persian_fa,
    });
  }

  return new DateObject({
    date: value,
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
}

function toJalaliValue(date: DateObject): JalaliCalendarValue {
  const persianDate =
    date.calendar.name === "persian"
      ? date
      : date.convert(persian, persian_fa);
  return {
    year: persianDate.year,
    month: persianDate.month.number,
    day: persianDate.day,
  };
}

/** Gregorian ISO `YYYY-MM-DD` from a Jalali calendar selection. */
export function jalaliValueToIso(value: JalaliCalendarValue): string {
  return new DateObject({
    year: value.year,
    month: value.month,
    day: value.day,
    calendar: persian,
    locale: persian_fa,
  })
    .convert(gregorian, gregorian_en)
    .format("YYYY-MM-DD");
}

export function JalaliCalendar({
  "aria-label": ariaLabel,
  value,
  onChange,
  minDate,
  maxDate,
  numberOfMonths = 1,
  buttons,
  className,
  calendarClassName,
}: JalaliCalendarProps) {
  const styles = jalaliCalendarVariants();
  const calendarValue = toDateObject(value);

  return (
    <div
      aria-label={ariaLabel}
      className={styles.root({ className })}
      role="group"
    >
      <Calendar
        buttons={buttons}
        calendar={persian}
        className={[styles.calendar(), calendarClassName]
          .filter(Boolean)
          .join(" ")}
        locale={persian_fa}
        maxDate={toDateObject(maxDate)}
        minDate={toDateObject(minDate)}
        numberOfMonths={numberOfMonths}
        shadow={false}
        showOtherDays
        value={calendarValue}
        weekStartDayIndex={0}
        onChange={(next) => {
          if (!next || Array.isArray(next)) return;
          onChange?.(toJalaliValue(next), next);
        }}
      />
    </div>
  );
}

export { toDateObject as jalaliCalendarToDateObject };
export type { DateObject };
