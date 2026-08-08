import type {
  ClubCalendarDay,
  ClubCalendarOccurrence,
  ClubCalendarResponse,
} from "@repo/api/discovery";
import { toJalali } from "@/shared/lib/jalali";

/** @deprecated Prefer `isDiscoveryApiId(clubId)` in the calendar hook. */
export const USE_CLUB_CALENDAR_API = true;

const WEEKDAY_KEYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

export type ClubCalendarWeekdayKey = (typeof WEEKDAY_KEYS)[number];

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

/** e.g. `۲۵ خرداد` for class card date lines. */
export function formatJalaliDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const { jm, jd } = toJalali(y!, m!, d!);
  const month = JALALI_MONTHS_FA[jm - 1] ?? "";
  return `${jd.toLocaleString("fa-IR")} ${month}`;
}

export function slotDurationLabel(startTime: string, endTime: string): string {
  return durationLabel(startTime, endTime);
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

export function weekdayKey(weekday: number): ClubCalendarWeekdayKey {
  return WEEKDAY_KEYS[weekday] ?? "saturday";
}

function durationLabel(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = eh! * 60 + em! - (sh! * 60 + sm!);
  if (mins <= 0) return startTime;
  return `${mins.toLocaleString("fa-IR")} دقیقه`;
}

function coachName(
  coach: ClubCalendarOccurrence["coach"],
): string {
  if (!coach) return "—";
  const parts = [coach.name.first, coach.name.last].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

export type ClubCalendarListItem = {
  id: string;
  slotId: string;
  classId: string | null;
  kind: ClubCalendarOccurrence["kind"];
  title: string;
  category: string;
  author: string;
  duration: string;
  startTime: string;
  endTime: string;
  occurrenceStatus: ClubCalendarOccurrence["occurrenceStatus"];
  backgroundImage?: string;
};

export function mapOccurrenceToListItem(
  item: ClubCalendarOccurrence,
): ClubCalendarListItem {
  const title =
    item.class?.title ??
    (item.kind === "session" ? "جلسه خصوصی" : "کلاس");
  return {
    id: `${item.slotId}-${item.startTime}`,
    slotId: item.slotId,
    classId: item.class?.id ?? null,
    kind: item.kind,
    title,
    category: item.kind === "class" ? "کلاس" : "جلسه",
    author: coachName(item.coach),
    duration: durationLabel(item.startTime, item.endTime),
    startTime: item.startTime,
    endTime: item.endTime,
    occurrenceStatus: item.occurrenceStatus,
  };
}

function seedOccurrences(clubId: string, date: string, weekday: number): ClubCalendarOccurrence[] {
  const hash = [...clubId, ...date].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  if (weekday === 5) return []; // Friday often empty
  const items: ClubCalendarOccurrence[] = [
    {
      slotId: `${clubId}-slot-yoga`,
      kind: "class",
      class: {
        id: `${clubId}-yoga`,
        title: "یوگا صبحگاهی",
        media: { coverMediaId: null },
      },
      coach: {
        id: "coach-1",
        name: { first: "سارا", last: "محمدی" },
      },
      startTime: "08:00",
      endTime: "09:00",
      capacity: 20,
      occurrenceStatus: "scheduled",
    },
  ];
  if (hash % 2 === 0) {
    items.push({
      slotId: `${clubId}-slot-hiit`,
      kind: "class",
      class: {
        id: `${clubId}-hiit`,
        title: "HIIT پیشرفته",
        media: { coverMediaId: null },
      },
      coach: {
        id: "coach-2",
        name: { first: "علی", last: "رضایی" },
      },
      startTime: "18:30",
      endTime: "19:30",
      capacity: 15,
      occurrenceStatus: "scheduled",
    });
  }
  if (weekday === 1 || weekday === 3) {
    items.push({
      slotId: `${clubId}-slot-pt`,
      kind: "session",
      class: null,
      coach: {
        id: "coach-1",
        name: { first: "سارا", last: "محمدی" },
      },
      startTime: "11:00",
      endTime: "12:00",
      capacity: 1,
      occurrenceStatus: weekday === 3 ? "cancelled" : "scheduled",
    });
  }
  return items.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/** Mock calendar matching discovery `ClubCalendarResponse` shape. */
export function getMockClubCalendar(
  clubId: string,
  from: string,
  to: string,
): ClubCalendarResponse {
  const days: ClubCalendarDay[] = [];
  let cursor = from;
  while (cursor <= to) {
    const weekday = weekdaySat0(cursor);
    days.push({
      date: cursor,
      weekday,
      items: seedOccurrences(clubId, cursor, weekday),
    });
    cursor = addDaysIso(cursor, 1);
    if (days.length > 31) break;
  }
  return { timezone: "Asia/Tehran", days };
}

export function getDayItems(
  calendar: ClubCalendarResponse | undefined,
  date: string,
): ClubCalendarListItem[] {
  const day = calendar?.days.find((d) => d.date === date);
  if (!day) return [];
  return day.items.map(mapOccurrenceToListItem);
}
