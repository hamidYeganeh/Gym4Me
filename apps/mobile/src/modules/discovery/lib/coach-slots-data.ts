import {
  addDaysIso,
  todayIso,
  weekRangeContaining,
} from "./club-calendar-data";

export type CoachSlotsSlotStatus = "available" | "unavailable";

export type CoachSlotsSlot = {
  id: string;
  timeLabel: string;
  status: CoachSlotsSlotStatus;
};

export type CoachSlotsDay = {
  id: string;
  date: string;
  slots: CoachSlotsSlot[];
};

const TIME_POOL = [
  "۱۰:۰۰",
  "۱۱:۰۰",
  "۱۲:۰۰",
  "۱۳:۰۰",
  "۱۴:۰۰",
  "۱۵:۰۰",
  "۱۶:۰۰",
  "۱۷:۰۰",
] as const;

/** Deterministic mock schedule for a coach week (replaceable by API later). */
export function getCoachSlotsWeek(
  coachId: string,
  anchorIso: string,
): CoachSlotsDay[] {
  const { from } = weekRangeContaining(anchorIso);
  const today = todayIso();

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = addDaysIso(from, dayIndex);
    const seed = hashSeed(`${coachId}:${date}`);
    const slotCount = 3 + (seed % 4);
    const startOffset = seed % 3;

    const slots: CoachSlotsSlot[] = Array.from(
      { length: slotCount },
      (_, slotIndex) => {
        const time =
          TIME_POOL[(startOffset + slotIndex) % TIME_POOL.length] ?? "۱۰:۰۰";
        const unavailable = (seed + slotIndex * 3) % 5 === 0;
        return {
          id: `${coachId}-${date}-${time}`,
          timeLabel: time,
          status: unavailable ? "unavailable" : "available",
        };
      },
    );

    // Ensure today always has at least one bookable slot for demos.
    if (date === today && !slots.some((slot) => slot.status === "available")) {
      const first = slots[0];
      if (first) first.status = "available";
    }

    return { id: date, date, slots };
  });
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
