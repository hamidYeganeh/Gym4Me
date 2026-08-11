import type { CoachSlotsRangeQuery } from "./coach-slots.dto";

export const discoveryCoachSlotsKeys = {
  all: ["discovery", "coach-slots"] as const,
  lists: () => [...discoveryCoachSlotsKeys.all, "list"] as const,
  list: (userId: string, query: CoachSlotsRangeQuery) =>
    [...discoveryCoachSlotsKeys.lists(), userId, query] as const,
};
