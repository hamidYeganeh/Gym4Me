import type { DiscoveryClubReviewsQuery, DiscoveryClubsQuery } from "./clubs.dto";

export const discoveryClubsKeys = {
  all: ["discovery", "clubs"] as const,
  lists: () => [...discoveryClubsKeys.all, "list"] as const,
  list: (query: DiscoveryClubsQuery = {}) =>
    [...discoveryClubsKeys.lists(), query] as const,
  details: () => [...discoveryClubsKeys.all, "detail"] as const,
  detail: (clubId: string) => [...discoveryClubsKeys.details(), clubId] as const,
  reviews: (clubId: string, query: DiscoveryClubReviewsQuery = {}) =>
    [...discoveryClubsKeys.detail(clubId), "reviews", query] as const,
  branches: (clubId: string) =>
    [...discoveryClubsKeys.detail(clubId), "branches"] as const,
  classes: (clubId: string) =>
    [...discoveryClubsKeys.detail(clubId), "classes"] as const,
  coaches: (clubId: string) =>
    [...discoveryClubsKeys.detail(clubId), "coaches"] as const,
};
