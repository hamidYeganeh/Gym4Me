import type {
  ClubLifecycleStatus,
  KycStatus,
  ListQuery,
  ListQueryFilter,
  VerificationStatus,
} from "../types";
import type { Club } from "../account/clubs.dto";

export type { Club };

export type CoachVerificationUser = {
  id: string;
  phone?: string;
  name?: { first?: string | null; last?: string | null };
  code?: string | null;
  kycStatus?: KycStatus;
};

export type CoachVerificationItem = {
  userId: string;
  user?: CoachVerificationUser;
  verification: {
    status?: VerificationStatus;
    submittedAt: string | null;
    documentMediaIds: string[];
    credential: CoachVerificationCredential | null;
    reviewNote: string | null;
  };
  experience: { years?: number; headline?: string };
  bio: string | null;
};

export type CoachVerificationCredential = {
  typeKey: string;
  issuer: string;
  issuedAt: string | null;
  expiresAt: string;
};

export type CoachVerificationsSortBy =
  | "submittedAt"
  | "reviewedAt"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "experienceYears";

export type ListCoachVerificationsQuery =
  ListQuery<CoachVerificationsSortBy> & {
    status?: ListQueryFilter<VerificationStatus | "all">;
  };

export type ClubVerificationReviewsSortBy =
  | "submittedAt"
  | "reviewedAt"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "status";

export type ListClubReviewsQuery = ListQuery<ClubVerificationReviewsSortBy> & {
  status?: ListQueryFilter<ClubLifecycleStatus | "all">;
};

export type ReviewVerificationInput = {
  action: "approve" | "reject";
  reviewNote?: string;
};

export type ReviewCoachVerificationInput = ReviewVerificationInput & {
  credential?: {
    typeKey: string;
    issuer: string;
    issuedAt?: string;
    expiresAt: string;
  };
};

export type ReviewCoachResponse = {
  userId: string;
  verification: {
    status: VerificationStatus;
    reviewedAt: string;
    reviewNote: string | null;
    credential: CoachVerificationCredential | null;
  };
};
