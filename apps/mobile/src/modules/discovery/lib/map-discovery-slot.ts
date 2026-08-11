import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ClubSlot } from "@repo/api/discovery";
import type { ClubSlotListItem, SlotDetail } from "./slot-detail-data";

const WEEKDAY_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

function durationMinutes(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = eh! * 60 + em! - (sh! * 60 + sm!);
  if (!Number.isFinite(mins) || mins <= 0) return "—";
  return `${mins.toLocaleString("fa-IR")} دقیقه`;
}

function timeRangeLabel(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

function scheduleLabel(slot: ClubSlot): string {
  const { recurrence } = slot.schedule;
  if (recurrence.type === "once") {
    return recurrence.date ? `یک‌بار (${recurrence.date})` : "یک‌بار";
  }
  if (recurrence.weekday != null && WEEKDAY_FA[recurrence.weekday]) {
    return `هر ${WEEKDAY_FA[recurrence.weekday]}`;
  }
  return "هفتگی";
}

const KIND_TITLE_FA: Record<ClubSlot["kind"], string> = {
  session: "جلسه خصوصی",
  class: "کلاس باشگاه",
  space: "رزرو فضا / سالن",
};

const KIND_CATEGORY_FA: Record<ClubSlot["kind"], string> = {
  session: "جلسه",
  class: "کلاس",
  space: "فضا",
};

export function mapDiscoverySlotToListItem(slot: ClubSlot): ClubSlotListItem {
  const { startTime, endTime } = slot.schedule.recurrence;
  const isSession = slot.kind === "session";
  return {
    id: slot.id,
    title: KIND_TITLE_FA[slot.kind],
    category: KIND_CATEGORY_FA[slot.kind],
    coachName: "—",
    durationLabel: durationMinutes(startTime, endTime),
    timeLabel: timeRangeLabel(startTime, endTime),
    scheduleLabel: scheduleLabel(slot),
    capacity: slot.capacity,
    intensity: isSession ? "normal" : "intense",
    image: PLACEHOLDER_IMAGE,
    kind: slot.kind,
  };
}

export function mapDiscoverySlotToDetail(
  clubId: string,
  slot: ClubSlot,
  clubTitle?: string,
): SlotDetail {
  const list = mapDiscoverySlotToListItem(slot);
  return {
    id: slot.id,
    clubId,
    clubTitle: clubTitle ?? "باشگاه",
    kind: slot.kind,
    title: list.title,
    category: list.category,
    description:
      slot.kind === "session"
        ? "جلسه خصوصی با مربی باشگاه طبق زمان‌بندی تعریف‌شده."
        : slot.kind === "space"
          ? "رزرو فضا / سالن باشگاه طبق زمان‌بندی تعریف‌شده."
          : "کلاس گروهی باشگاه طبق زمان‌بندی تعریف‌شده.",
    image: PLACEHOLDER_IMAGE,
    coachName: list.coachName,
    coachId: slot.coachId ?? undefined,
    classId: slot.classId,
    capacity: slot.capacity,
    durationLabel: list.durationLabel,
    timeLabel: list.timeLabel,
    scheduleLabel: list.scheduleLabel,
    intensity: list.intensity,
    intensityLabelKey:
      list.intensity === "extreme"
        ? "calendarIntensityExtreme"
        : list.intensity === "normal"
          ? "calendarIntensityNormal"
          : "calendarIntensityIntense",
    upcoming: [],
  };
}
