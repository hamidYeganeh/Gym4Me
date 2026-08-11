import type { ApiClient } from "../client";
import { discoveryCoachSlotsEndpoints as ep } from "./coach-slots.endpoint";
import type {
  CoachSlotsRangeQuery,
  CoachSlotsResponse,
} from "./coach-slots.dto";

/** Public coach availability + consultation pricing. */
export function createDiscoveryCoachSlotsApi(client: ApiClient) {
  return {
    list(userId: string, query: CoachSlotsRangeQuery) {
      return client.request<CoachSlotsResponse>(ep.byUserId(userId), {
        query,
        public: true,
      });
    },
  };
}

export type DiscoveryCoachSlotsApi = ReturnType<
  typeof createDiscoveryCoachSlotsApi
>;
