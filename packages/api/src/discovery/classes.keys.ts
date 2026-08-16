import type { DiscoveryClassesQuery } from "./classes.dto";

export const discoveryClassesKeys = {
  all: ["discovery", "classes"] as const,
  lists: () => [...discoveryClassesKeys.all, "list"] as const,
  list: (query: DiscoveryClassesQuery = {}) =>
    [...discoveryClassesKeys.lists(), query] as const,
  details: () => [...discoveryClassesKeys.all, "detail"] as const,
  detail: (classId: string) =>
    [...discoveryClassesKeys.details(), classId] as const,
};
