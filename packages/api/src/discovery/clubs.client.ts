import type { ApiClient } from "../client";
import type { ItemsResponse, Paginated } from "../types";
import type {
  Club,
  ClubUserReview,
  CreateDiscoveryReviewInput,
  DiscoveryClubReviewsQuery,
  DiscoveryClubsQuery,
} from "./clubs.dto";
import { discoveryClubsEndpoints as ep } from "./clubs.endpoint";

/** Public discovery clubs (`/discovery/clubs`). */
export function createDiscoveryClubsApi(client: ApiClient) {
  return {
    list(query: DiscoveryClubsQuery = {}) {
      return client.request<Paginated<Club>>(ep.root, {
        query,
        public: true,
      });
    },

    get(clubId: string) {
      return client.request<Club>(ep.byId(clubId), { public: true });
    },

    listReviews(clubId: string, query: DiscoveryClubReviewsQuery = {}) {
      return client.request<Paginated<ClubUserReview>>(ep.reviews(clubId), {
        query,
        public: true,
      });
    },

    createReview(clubId: string, input: CreateDiscoveryReviewInput) {
      return client.request<ClubUserReview>(ep.reviews(clubId), {
        method: "POST",
        body: input,
      });
    },

    listBranches(clubId: string) {
      return client.request<ItemsResponse<Club>>(ep.branches(clubId), {
        public: true,
      });
    },

    listClasses(clubId: string) {
      return client.request<ItemsResponse<{ classId: string }>>(
        ep.classes(clubId),
        { public: true },
      );
    },

    listCoaches(clubId: string) {
      return client.request<ItemsResponse<{ coachId: string }>>(
        ep.coaches(clubId),
        { public: true },
      );
    },
  };
}

export type DiscoveryClubsApi = ReturnType<typeof createDiscoveryClubsApi>;
