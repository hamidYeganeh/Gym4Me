import type { ApiClient } from "../client";
import type { ItemsResponse, Paginated } from "../types";
import type {
  AdminClubReviewsQuery,
  AdminClubsListQuery,
  AdminCreateBranchInput,
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  ListClubReviewsQuery,
  ReviewVerificationInput,
  UpdateClubInput,
} from "./clubs.dto";
import { adminClubsEndpoints as ep } from "./clubs.endpoint";

/** Admin clubs API (`/admin/clubs`). */
export function createAdminClubsApi(client: ApiClient) {
  return {
    list(query: AdminClubsListQuery = {}) {
      return client.request<Paginated<Club>>(ep.root, { query });
    },

    get(clubId: string) {
      return client.request<Club>(ep.byId(clubId));
    },

    create(input: AdminCreateClubInput) {
      return client.request<Club>(ep.root, { method: "POST", body: input });
    },

    update(clubId: string, input: UpdateClubInput) {
      return client.request<Club>(ep.byId(clubId), {
        method: "PATCH",
        body: input,
      });
    },

    remove(clubId: string) {
      return client.request<{ success: true }>(ep.byId(clubId), {
        method: "DELETE",
      });
    },

    activate(clubId: string) {
      return client.request<Club>(ep.activate(clubId), { method: "POST" });
    },

    deactivate(clubId: string) {
      return client.request<Club>(ep.deactivate(clubId), { method: "POST" });
    },

    listVerification(query: ListClubReviewsQuery = {}) {
      return client.request<Paginated<Club>>(ep.verification, {
        query,
      });
    },

    reviewLifecycle(clubId: string, input: ReviewVerificationInput) {
      return client.request<Club>(ep.verificationById(clubId), {
        method: "PATCH",
        body: input,
      });
    },

    listReviews(clubId: string, query: AdminClubReviewsQuery = {}) {
      return client.request<Paginated<ClubUserReview>>(ep.reviews(clubId), {
        query,
      });
    },

    moderateReview(
      clubId: string,
      reviewId: string,
      status: ClubUserReview["status"],
    ) {
      return client.request<ClubUserReview>(ep.reviewById(clubId, reviewId), {
        method: "PATCH",
        body: { status },
      });
    },

    grantAchievement(clubId: string, achievementId: string) {
      return client.request<Club>(ep.achievements(clubId), {
        method: "POST",
        body: { achievementId },
      });
    },

    listBranches(clubId: string) {
      return client.request<ItemsResponse<Club>>(ep.branches(clubId));
    },

    createBranch(clubId: string, input: AdminCreateBranchInput) {
      return client.request<Club>(ep.branches(clubId), {
        method: "POST",
        body: input,
      });
    },

    listClasses(clubId: string) {
      return client.request<ItemsResponse<{ classId: string }>>(
        ep.classes(clubId),
      );
    },

    listCoaches(clubId: string) {
      return client.request<ItemsResponse<{ coachId: string }>>(
        ep.coaches(clubId),
      );
    },

    assignCoach(clubId: string, coachId: string) {
      return client.request<ItemsResponse<{ coachId: string }>>(
        ep.coaches(clubId),
        { method: "POST", body: { coachId } },
      );
    },

    unassignCoach(clubId: string, coachId: string) {
      return client.request<ItemsResponse<{ coachId: string }>>(
        ep.coachById(clubId, coachId),
        { method: "DELETE" },
      );
    },
  };
}

export type AdminClubsApi = ReturnType<typeof createAdminClubsApi>;
