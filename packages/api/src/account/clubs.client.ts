import type { ApiClient } from "../client";
import type { ItemsResponse, Paginated } from "../types";
import type {
  AccountClubReviewsQuery,
  AccountClubsListQuery,
  Club,
  ClubUserReview,
  CreateClubInput,
  SubmitClubReviewInput,
  UpdateClubInput,
} from "./clubs.dto";
import { accountClubsEndpoints as ep } from "./clubs.endpoint";

/** Club-owner facing API (`/club_owner/clubs`). */
export function createClubOwnerClubsApi(client: ApiClient) {
  return {
    list(query: AccountClubsListQuery = {}) {
      return client.request<Paginated<Club>>(ep.root, { query });
    },

    get(clubId: string) {
      return client.request<Club>(ep.byId(clubId));
    },

    create(input: CreateClubInput) {
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

    submit(clubId: string, input: SubmitClubReviewInput) {
      return client.request<Club>(ep.submit(clubId), {
        method: "POST",
        body: input,
      });
    },

    listReviews(clubId: string, query: AccountClubReviewsQuery = {}) {
      return client.request<Paginated<ClubUserReview>>(ep.reviews(clubId), {
        query,
      });
    },

    replyReview(clubId: string, reviewId: string, text: string) {
      return client.request<ClubUserReview>(ep.replyReview(clubId, reviewId), {
        method: "POST",
        body: { text },
      });
    },

    listBranches(clubId: string) {
      return client.request<ItemsResponse<Club>>(ep.branches(clubId));
    },

    createBranch(clubId: string, input: CreateClubInput) {
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
      return client.request<ItemsResponse<Club["coaches"][number]>>(
        ep.coaches(clubId),
      );
    },

    assignCoach(clubId: string, coachId: string) {
      return client.request<ItemsResponse<Club["coaches"][number]>>(
        ep.coaches(clubId),
        { method: "POST", body: { coachId } },
      );
    },

    unassignCoach(clubId: string, coachId: string) {
      return client.request<ItemsResponse<Club["coaches"][number]>>(
        ep.coachById(clubId, coachId),
        { method: "DELETE" },
      );
    },
  };
}

/** @deprecated Use createClubOwnerClubsApi */
export const createAccountClubsApi = createClubOwnerClubsApi;

export type ClubOwnerClubsApi = ReturnType<typeof createClubOwnerClubsApi>;
export type AccountClubsApi = ClubOwnerClubsApi;
