import type { CreateClubInput } from "../account/clubs.dto";

export type {
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  CreateClubInput,
  UpdateClubInput,
} from "../account/clubs.dto";

export type {
  ListClubReviewsQuery,
  ReviewVerificationInput,
} from "./verification.dto";

export type AdminClubsListQuery = Record<string, string | number | undefined>;

export type AdminClubReviewsQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export type AdminCreateBranchInput = CreateClubInput & { ownerId?: string };
