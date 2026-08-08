import type {
  ListClubReviewsQuery,
  ListCoachVerificationsQuery,
} from "./verification.dto";

export const adminVerificationKeys = {
  all: ["admin", "verification"] as const,
  coachLists: () => [...adminVerificationKeys.all, "coaches", "list"] as const,
  coachList: (query: ListCoachVerificationsQuery = {}) =>
    [...adminVerificationKeys.coachLists(), query] as const,
  clubLists: () => [...adminVerificationKeys.all, "clubs", "list"] as const,
  clubList: (query: ListClubReviewsQuery = {}) =>
    [...adminVerificationKeys.clubLists(), query] as const,
};
