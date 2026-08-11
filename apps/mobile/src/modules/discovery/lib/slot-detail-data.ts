import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { getAllClubIds, getClubDetail } from "./club-detail-data";
import type { ClubCalendarSlotIntensity } from "./club-calendar-data";

export type SlotDetailUpcoming = {
  id: string;
  date: string;
  /** Jalali display e.g. `۲۵ خرداد`. */
  dateLabel: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "cancelled";
};

export type SlotDetail = {
  id: string;
  clubId: string;
  clubTitle: string;
  kind: "class" | "session" | "space";
  title: string;
  category: string;
  description: string;
  image: string;
  coachName: string;
  coachId?: string;
  classId?: string | null;
  capacity: number;
  durationLabel: string;
  /** e.g. `۰۸:۰۰ – ۰۹:۰۰` */
  timeLabel: string;
  /** e.g. `هر شنبه` / `یک‌بار` */
  scheduleLabel: string;
  intensity: ClubCalendarSlotIntensity;
  intensityLabelKey:
    | "calendarIntensityIntense"
    | "calendarIntensityNormal"
    | "calendarIntensityExtreme";
  upcoming: SlotDetailUpcoming[];
};

export type ClubSlotListItem = {
  id: string;
  title: string;
  category: string;
  coachName: string;
  durationLabel: string;
  timeLabel: string;
  scheduleLabel: string;
  capacity: number;
  intensity: ClubCalendarSlotIntensity;
  image?: string;
  kind: "class" | "session" | "space";
};

const WEEKDAY_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

type SlotSeed = {
  idSuffix: string;
  kind: "class" | "session" | "space";
  title: string;
  category: string;
  coachName: string;
  coachId: string;
  classIdSuffix?: string;
  capacity: number;
  startTime: string;
  endTime: string;
  weekday: number;
  intensity: ClubCalendarSlotIntensity;
  description: string;
};

const SLOT_SEEDS: SlotSeed[] = [
  {
    idSuffix: "slot-yoga",
    kind: "class",
    title: "یوگا صبحگاهی",
    category: "کلاس",
    coachName: "سارا محمدی",
    coachId: "coach-1",
    classIdSuffix: "yoga",
    capacity: 20,
    startTime: "08:00",
    endTime: "09:00",
    weekday: 0,
    intensity: "intense",
    description:
      "جلسه یوگا برای شروع روز با تمرکز روی تنفس، انعطاف و آرامش ذهن. مناسب همه سطوح.",
  },
  {
    idSuffix: "slot-hiit-am",
    kind: "class",
    title: "HIIT & Cardio Burn",
    category: "کلاس",
    coachName: "علی رضایی",
    coachId: "coach-2",
    classIdSuffix: "hiit-am",
    capacity: 16,
    startTime: "08:00",
    endTime: "08:30",
    weekday: 1,
    intensity: "extreme",
    description:
      "بازه کوتاه و پرفشار کاردیو برای سوزاندن کالری و بالا بردن ضربان قلب.",
  },
  {
    idSuffix: "slot-hiit",
    kind: "class",
    title: "HIIT پیشرفته",
    category: "کلاس",
    coachName: "علی رضایی",
    coachId: "coach-2",
    classIdSuffix: "hiit",
    capacity: 15,
    startTime: "18:30",
    endTime: "19:30",
    weekday: 2,
    intensity: "extreme",
    description:
      "تمرین اینتروال پیشرفته با تمرکز روی قدرت و استقامت. مناسب ورزشکاران با تجربه.",
  },
  {
    idSuffix: "slot-spin",
    kind: "class",
    title: "اسپینینگ عصر",
    category: "کلاس",
    coachName: "نیکا احمدی",
    coachId: "coach-3",
    classIdSuffix: "spin",
    capacity: 12,
    startTime: "18:45",
    endTime: "19:45",
    weekday: 3,
    intensity: "intense",
    description:
      "کلاس دوچرخه ثابت با موسیقی و مربی‌گری انگیزشی برای کالری‌سوزی عصرگاهی.",
  },
  {
    idSuffix: "slot-pt",
    kind: "session",
    title: "جلسه خصوصی",
    category: "جلسه",
    coachName: "سارا محمدی",
    coachId: "coach-1",
    capacity: 1,
    startTime: "11:00",
    endTime: "12:00",
    weekday: 1,
    intensity: "normal",
    description:
      "جلسه خصوصی یک‌به‌یک با مربی برای برنامه شخصی‌سازی‌شده و اصلاح فرم حرکت.",
  },
];

function durationMinutes(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = eh! * 60 + em! - (sh! * 60 + sm!);
  return `${mins.toLocaleString("fa-IR")} دقیقه`;
}

function timeRangeLabel(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

function scheduleLabel(weekday: number): string {
  return `هر ${WEEKDAY_FA[weekday] ?? "هفته"}`;
}

function intensityLabelKey(
  intensity: ClubCalendarSlotIntensity,
): SlotDetail["intensityLabelKey"] {
  if (intensity === "extreme") return "calendarIntensityExtreme";
  if (intensity === "normal") return "calendarIntensityNormal";
  return "calendarIntensityIntense";
}

function toListItem(clubId: string, seed: SlotSeed): ClubSlotListItem {
  return {
    id: `${clubId}-${seed.idSuffix}`,
    title: seed.title,
    category: seed.category,
    coachName: seed.coachName,
    durationLabel: durationMinutes(seed.startTime, seed.endTime),
    timeLabel: timeRangeLabel(seed.startTime, seed.endTime),
    scheduleLabel: scheduleLabel(seed.weekday),
    capacity: seed.capacity,
    intensity: seed.intensity,
    image: PLACEHOLDER_IMAGE,
    kind: seed.kind,
  };
}

function toDetail(clubId: string, seed: SlotSeed): SlotDetail {
  const club = getClubDetail(clubId);
  const slotId = `${clubId}-${seed.idSuffix}`;
  return {
    id: slotId,
    clubId,
    clubTitle: club?.title ?? "باشگاه",
    kind: seed.kind,
    title: seed.title,
    category: seed.category,
    description: seed.description,
    image: PLACEHOLDER_IMAGE,
    coachName: seed.coachName,
    coachId: seed.coachId,
    classId: seed.classIdSuffix ? `${clubId}-${seed.classIdSuffix}` : null,
    capacity: seed.capacity,
    durationLabel: durationMinutes(seed.startTime, seed.endTime),
    timeLabel: timeRangeLabel(seed.startTime, seed.endTime),
    scheduleLabel: scheduleLabel(seed.weekday),
    intensity: seed.intensity,
    intensityLabelKey: intensityLabelKey(seed.intensity),
    upcoming: [
      {
        id: `${slotId}-u1`,
        date: "2026-08-09",
        dateLabel: "۱۸ مرداد",
        startTime: seed.startTime,
        endTime: seed.endTime,
        status: "scheduled",
      },
      {
        id: `${slotId}-u2`,
        date: "2026-08-16",
        dateLabel: "۲۵ مرداد",
        startTime: seed.startTime,
        endTime: seed.endTime,
        status: "scheduled",
      },
      {
        id: `${slotId}-u3`,
        date: "2026-08-23",
        dateLabel: "۱ شهریور",
        startTime: seed.startTime,
        endTime: seed.endTime,
        status: seed.idSuffix === "slot-pt" ? "cancelled" : "scheduled",
      },
    ],
  };
}

export function getClubSlots(clubId: string): ClubSlotListItem[] {
  return SLOT_SEEDS.map((seed) => toListItem(clubId, seed));
}

export function getSlotDetail(
  clubId: string,
  slotId: string,
): SlotDetail | undefined {
  const seed = SLOT_SEEDS.find(
    (item) =>
      slotId === `${clubId}-${item.idSuffix}` ||
      slotId.endsWith(item.idSuffix),
  );
  if (!seed) return undefined;
  return toDetail(clubId, seed);
}

export function getAllSlotParams(): Array<{ clubId: string; slotId: string }> {
  return getAllClubIds().flatMap((clubId) =>
    SLOT_SEEDS.map((seed) => ({
      clubId,
      slotId: `${clubId}-${seed.idSuffix}`,
    })),
  );
}
