import type {
  AdminClubReviewsQuery,
  AdminClubsListQuery,
  ListClubReviewsQuery,
} from "./clubs.dto";

export const adminClubsKeys = {
  all: ["admin", "clubs"] as const,
  lists: () => [...adminClubsKeys.all, "list"] as const,
  list: (query: AdminClubsListQuery = {}) =>
    [...adminClubsKeys.lists(), query] as const,
  details: () => [...adminClubsKeys.all, "detail"] as const,
  detail: (clubId: string) => [...adminClubsKeys.details(), clubId] as const,
  verificationLists: () =>
    [...adminClubsKeys.all, "verification", "list"] as const,
  verificationList: (query: ListClubReviewsQuery = {}) =>
    [...adminClubsKeys.verificationLists(), query] as const,
  reviews: (clubId: string, query: AdminClubReviewsQuery = {}) =>
    [...adminClubsKeys.detail(clubId), "reviews", query] as const,
  branches: (clubId: string) =>
    [...adminClubsKeys.detail(clubId), "branches"] as const,
  classes: (clubId: string) =>
    [...adminClubsKeys.detail(clubId), "classes"] as const,
  coaches: (clubId: string) =>
    [...adminClubsKeys.detail(clubId), "coaches"] as const,
};
