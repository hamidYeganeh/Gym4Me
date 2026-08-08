import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type {
  ClubCalendarOccurrence,
  ClubCalendarResponse,
  ClubClass,
} from "@repo/api/discovery";
import { mediaFileUrl } from "@/shared/lib/api";
import type { ClassDetail } from "./class-detail-data";
import type { ClubDetailClassPreview } from "./club-detail-data";
import {
  formatJalaliDateShort,
  slotDurationLabel,
} from "./club-calendar-data";

function displayName(name?: { first?: string | null; last?: string | null } | null) {
  return [name?.first, name?.last].filter(Boolean).join(" ").trim();
}

function coachDisplayName(cls: ClubClass): string {
  if (cls.coach && typeof cls.coach === "object" && "name" in cls.coach) {
    return displayName(
      cls.coach.name as { first?: string | null; last?: string | null },
    );
  }
  return "";
}

type NextOccurrence = {
  date: string;
  startTime: string;
  endTime: string;
  coach: ClubCalendarOccurrence["coach"];
};

function nextOccurrenceForClass(
  classId: string,
  calendar: ClubCalendarResponse | null | undefined,
): NextOccurrence | null {
  if (!calendar) return null;
  for (const day of calendar.days) {
    for (const item of day.items) {
      if (item.class?.id !== classId) continue;
      if (item.occurrenceStatus === "cancelled") continue;
      return {
        date: day.date,
        startTime: item.startTime,
        endTime: item.endTime,
        coach: item.coach,
      };
    }
  }
  return null;
}

function upcomingScheduleLabels(
  classId: string,
  calendar: ClubCalendarResponse | null | undefined,
  limit = 5,
): string[] {
  if (!calendar) return [];
  const tags: string[] = [];
  for (const day of calendar.days) {
    for (const item of day.items) {
      if (item.class?.id !== classId) continue;
      if (item.occurrenceStatus === "cancelled") continue;
      tags.push(
        `${formatJalaliDateShort(day.date)} · ${item.startTime}–${item.endTime}`,
      );
      if (tags.length >= limit) return tags;
    }
  }
  return tags;
}

export function mapDiscoveryClassToPreview(
  cls: ClubClass,
  calendar?: ClubCalendarResponse | null,
): ClubDetailClassPreview {
  const next = nextOccurrenceForClass(cls.id, calendar);
  const coachName =
    coachDisplayName(cls) ||
    (next?.coach
      ? displayName(next.coach.name)
      : "");

  return {
    id: cls.id,
    category: "کلاس",
    date: next ? formatJalaliDateShort(next.date) : "زمان‌بندی نشده",
    title: cls.title,
    author: coachName || "مربی اعلام نشده",
    duration: next
      ? slotDurationLabel(next.startTime, next.endTime)
      : "—",
    backgroundImage:
      mediaFileUrl(cls.media?.coverMediaId) ?? PLACEHOLDER_IMAGE,
  };
}

export function mapDiscoveryClassToDetail(
  clubId: string,
  cls: ClubClass,
  calendar?: ClubCalendarResponse | null,
): ClassDetail {
  const cover = mediaFileUrl(cls.media?.coverMediaId) ?? PLACEHOLDER_IMAGE;
  const coachName = coachDisplayName(cls);
  const next = nextOccurrenceForClass(cls.id, calendar);
  const upcoming = upcomingScheduleLabels(cls.id, calendar);
  const durationLabel = next
    ? `${next.startTime} – ${next.endTime}`
    : "";
  const minutesLabel = next
    ? slotDurationLabel(next.startTime, next.endTime)
    : "";

  return {
    id: cls.id,
    clubId,
    category: "کلاس گروهی",
    title: cls.title,
    tagline: coachName ? `با مربی ${coachName}` : (cls.description ?? ""),
    image: cover,
    gallery: [cover],
    durationLabel: minutesLabel || durationLabel || "—",
    rating: "—",
    caloriesLabel: "",
    description: cls.description ?? "",
    benefits:
      upcoming.length > 0
        ? upcoming.map((slot) => `سانس: ${slot}`)
        : ["برنامه زمانی هنوز اعلام نشده"],
    tags: upcoming.slice(0, 3),
    sessionDuration: {
      range: minutesLabel.replace(" دقیقه", "") || "—",
      unit: minutesLabel.includes("دقیقه") ? "دقیقه" : "",
      caption: next
        ? `نزدیک‌ترین سانس · ${formatJalaliDateShort(next.date)}`
        : "نزدیک‌ترین سانس",
      progress: upcoming.length > 0 ? 0.7 : 0.25,
    },
    intensity: {
      score: String(upcoming.length || "—"),
      label: "سانس آینده",
      description:
        upcoming.length > 0
          ? `${upcoming.length.toLocaleString("fa-IR")} سانس در دو هفته پیش رو`
          : "سانسی در بازه تقویم نیست",
    },
    instructions: [],
    planSteps: [],
    related: [],
  };
}
