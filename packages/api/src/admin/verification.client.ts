import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type { Club } from "../account/clubs.dto";
import type {
  ListRoleRequestsQuery,
  ReviewRoleRequestInput,
  RoleRequest,
  RoleRequestAdminItem,
} from "../account/roles.dto";
import type {
  CoachVerificationItem,
  ListClubReviewsQuery,
  ListCoachVerificationsQuery,
  ReviewCoachResponse,
  ReviewCoachVerificationInput,
  ReviewVerificationInput,
} from "./verification.dto";
import { adminVerificationEndpoints as ep } from "./verification.endpoint";

/** Admin coach/club verification (`/admin/coaches`, `/admin/clubs`). */
export function createAdminVerificationApi(client: ApiClient) {
  return {
    listCoachVerifications(query: ListCoachVerificationsQuery = {}) {
      return client.request<Paginated<CoachVerificationItem>>(
        ep.coachVerifications,
        { query },
      );
    },

    reviewCoach(userId: string, input: ReviewCoachVerificationInput) {
      return client.request<ReviewCoachResponse>(ep.coachVerification(userId), {
        method: "PATCH",
        body: input,
      });
    },

    listClubReviews(query: ListClubReviewsQuery = {}) {
      return client.request<Paginated<Club>>(ep.clubVerificationList, {
        query,
      });
    },

    reviewClub(id: string, input: ReviewVerificationInput) {
      return client.request<Club>(ep.clubVerification(id), {
        method: "PATCH",
        body: input,
      });
    },

    listRoleRequests(query: ListRoleRequestsQuery = {}) {
      return client.request<Paginated<RoleRequestAdminItem>>(ep.roleRequests, {
        query,
      });
    },

    reviewRoleRequest(id: string, input: ReviewRoleRequestInput) {
      return client.request<RoleRequest>(ep.roleRequest(id), {
        method: "PATCH",
        body: input,
      });
    },
  };
}

export type AdminVerificationApi = ReturnType<
  typeof createAdminVerificationApi
>;
