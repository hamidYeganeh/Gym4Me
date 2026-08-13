import type {
  ClubOperationalStatus,
  ClubUserReviewStatus,
  CreateClubInput,
  GeoDirection,
} from "../account/clubs.dto";
import type {
  ClubLifecycleStatus,
  ListQuery,
  ListQueryFilter,
} from "../types";

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

export type AdminClubsSortBy =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "status"
  | "operationalStatus"
  | "rating";

export type AdminClubsListQuery = ListQuery<AdminClubsSortBy> & {
  /** Existing clubs search alias; `search` is also supported by `ListQuery`. */
  q?: string;
  categoryId?: string;
  sportId?: string;
  locationId?: string;
  direction?: GeoDirection;
  ownerId?: string;
  lifecycleStatus?: ListQueryFilter<ClubLifecycleStatus>;
  operationalStatus?: ListQueryFilter<ClubOperationalStatus>;
};

export type AdminClubReviewsSortBy =
  | "createdAt"
  | "updatedAt"
  | "rating"
  | "status";

export type AdminClubReviewsQuery = ListQuery<AdminClubReviewsSortBy> & {
  status?: ListQueryFilter<ClubUserReviewStatus>;
};

export type AdminCreateBranchInput = CreateClubInput & { ownerId?: string };
