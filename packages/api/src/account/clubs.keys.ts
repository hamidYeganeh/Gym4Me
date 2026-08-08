import type {
  AccountClubReviewsQuery,
  AccountClubsListQuery,
} from "./clubs.dto";

export const accountClubsKeys = {
  all: ["account", "clubs"] as const,
  lists: () => [...accountClubsKeys.all, "list"] as const,
  list: (query: AccountClubsListQuery = {}) =>
    [...accountClubsKeys.lists(), query] as const,
  details: () => [...accountClubsKeys.all, "detail"] as const,
  detail: (clubId: string) => [...accountClubsKeys.details(), clubId] as const,
  reviews: (clubId: string, query: AccountClubReviewsQuery = {}) =>
    [...accountClubsKeys.detail(clubId), "reviews", query] as const,
  branches: (clubId: string) =>
    [...accountClubsKeys.detail(clubId), "branches"] as const,
  classes: (clubId: string) =>
    [...accountClubsKeys.detail(clubId), "classes"] as const,
  coaches: (clubId: string) =>
    [...accountClubsKeys.detail(clubId), "coaches"] as const,
};
