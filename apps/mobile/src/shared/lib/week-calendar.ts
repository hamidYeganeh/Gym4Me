import { toJalali } from "./jalali";

/** Saturday-first weekday keys used by calendar i18n labels. */
export const WEEKDAY_KEYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

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

/** 0 = Saturday. */
export function weekdaySat0(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0)).getUTCDay();
  return (jsDay + 1) % 7;
}

export function addDaysIso(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + days, 12, 0, 0));
  return [
    dt.getUTCFullYear(),
    String(dt.getUTCMonth() + 1).padStart(2, "0"),
    String(dt.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function todayIso(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Saturday-start week containing `anchorIso`. */
export function weekRangeContaining(anchorIso: string): {
  from: string;
  to: string;
} {
  const weekday = weekdaySat0(anchorIso);
  const from = addDaysIso(anchorIso, -weekday);
  return { from, to: addDaysIso(from, 6) };
}

export function formatJalaliDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const { jd } = toJalali(y!, m!, d!);
  return String(jd);
}

/** e.g. `۲۵ خرداد`. */
export function formatJalaliDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const { jm, jd } = toJalali(y!, m!, d!);
  const month = JALALI_MONTHS_FA[jm - 1] ?? "";
  return `${jd.toLocaleString("fa-IR")} ${month}`;
}

export function formatJalaliRangeLabel(from: string, to: string): string {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = toJalali(fy!, fm!, fd!);
  const end = toJalali(ty!, tm!, td!);
  const startMonth = JALALI_MONTHS_FA[start.jm - 1] ?? "";
  const endMonth = JALALI_MONTHS_FA[end.jm - 1] ?? "";
  if (start.jm === end.jm && start.jy === end.jy) {
    return `${start.jd} تا ${end.jd} ${startMonth}`;
  }
  return `${start.jd} ${startMonth} تا ${end.jd} ${endMonth}`;
}

export function weekdayKey(weekday: number): WeekdayKey {
  return WEEKDAY_KEYS[weekday] ?? "saturday";
}
