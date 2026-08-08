import type { ClubCalendarQuery } from "./club-slots.dto";

export const discoveryClubSlotsKeys = {
  all: ["discovery", "club-slots"] as const,
  calendar: (clubId: string, query: ClubCalendarQuery) =>
    [...discoveryClubSlotsKeys.all, "calendar", clubId, query] as const,
  classes: (clubId: string) =>
    [...discoveryClubSlotsKeys.all, "classes", clubId] as const,
  class: (clubId: string, classId: string) =>
    [...discoveryClubSlotsKeys.classes(clubId), classId] as const,
};
