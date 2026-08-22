import type { CalendarDate } from "@internationalized/date";

/** Jalali (Persian) calendar day. */
export type JalaliCalendarValue = {
  year: number;
  month: number;
  day: number;
};

export type JalaliCalendarProps = {
  /** Accessible name for the calendar region. */
  "aria-label"?: string;
  value?: JalaliCalendarValue | string | Date | null;
  onChange?: (value: JalaliCalendarValue, date: CalendarDate) => void;
  minDate?: JalaliCalendarValue | string | Date;
  maxDate?: JalaliCalendarValue | string | Date;
  /** Stacked month count (e.g. drawer pickers). Default 1. */
  numberOfMonths?: number;
  /** Hide prev/next month buttons (useful for stacked months). */
  buttons?: boolean;
  className?: string;
  /** Extra classes on the HeroUI calendar root. */
  calendarClassName?: string;
};
