import type { CoachSlotsRangeQuery } from "./coach-slots.dto";

export const coachSlotsKeys = {
  all: ["coach", "slots"] as const,
  lists: () => [...coachSlotsKeys.all, "list"] as const,
  list: (query: CoachSlotsRangeQuery) =>
    [...coachSlotsKeys.lists(), query] as const,
  clubs: () => [...coachSlotsKeys.all, "clubs"] as const,
};
