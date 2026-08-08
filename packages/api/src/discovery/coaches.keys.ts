import type { DiscoveryCoachesQuery } from "./coaches.dto";

export const discoveryCoachesKeys = {
  all: ["discovery", "coaches"] as const,
  lists: () => [...discoveryCoachesKeys.all, "list"] as const,
  list: (query: DiscoveryCoachesQuery = {}) =>
    [...discoveryCoachesKeys.lists(), query] as const,
  details: () => [...discoveryCoachesKeys.all, "detail"] as const,
  detail: (userId: string) =>
    [...discoveryCoachesKeys.details(), userId] as const,
};
