import type { Booking } from "@repo/api";
import { toJalali } from "./jalali";

/** UPPER_SNAKE booking status used across existing screens/i18n keys. */
export type BookingStatusView =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "REJECTED";

const JALALI_MONTHS_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

const WEEKDAYS_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
] as const;

export function bookingStatusView(status: Booking["status"]): BookingStatusView {
  return status.toUpperCase() as BookingStatusView;
}

export function faDigits(value: number | string): string {
  return String(value).replace(
    /\d/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit,
  );
}

export function formatTomans(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export function formatTimeFa(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return faDigits(`${hh}:${mm}`);
}

export function formatTimeRangeFa(startIso: string, endIso: string): string {
  return `${formatTimeFa(startIso)} تا ${formatTimeFa(endIso)}`;
}

/** e.g. `شنبه ۱۸ مرداد ۱۴۰۵`. */
export function formatJalaliFullDate(iso: string): string {
  const date = new Date(iso);
  const { jy, jm, jd } = toJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const weekday = WEEKDAYS_FA[date.getDay()] ?? "";
  const month = JALALI_MONTHS_FA[jm - 1] ?? "";
  return `${weekday} ${faDigits(jd)} ${month} ${faDigits(jy)}`;
}

/** e.g. `شنبه ۱۸ مرداد، ۱۸:۰۰` for list cards. */
export function formatJalaliDateTime(iso: string): string {
  const date = new Date(iso);
  const { jm, jd } = toJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const weekday = WEEKDAYS_FA[date.getDay()] ?? "";
  const month = JALALI_MONTHS_FA[jm - 1] ?? "";
  return `${weekday} ${faDigits(jd)} ${month}، ${formatTimeFa(iso)}`;
}

/** e.g. `۱۸ مرداد` short form. */
export function formatJalaliShort(iso: string): string {
  const date = new Date(iso);
  const { jm, jd } = toJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const month = JALALI_MONTHS_FA[jm - 1] ?? "";
  return `${faDigits(jd)} ${month}`;
}

export function bookingUserName(
  user: Booking["coach"] | Booking["athlete"],
): string {
  if (!user) return "—";
  return (
    [user.name.first, user.name.last].filter(Boolean).join(" ").trim() || "—"
  );
}
