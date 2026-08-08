import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  DiscoveryCoach,
  DiscoveryCoachesQuery,
} from "./coaches.dto";
import { discoveryCoachesEndpoints as ep } from "./coaches.endpoint";

/** Public discovery coaches (`/discovery/coaches`). */
export function createDiscoveryCoachesApi(client: ApiClient) {
  return {
    list(query: DiscoveryCoachesQuery = {}) {
      return client.request<Paginated<DiscoveryCoach>>(ep.root, {
        query,
        public: true,
      });
    },

    get(userId: string) {
      return client.request<DiscoveryCoach>(ep.byUserId(userId), {
        public: true,
      });
    },
  };
}

export type DiscoveryCoachesApi = ReturnType<typeof createDiscoveryCoachesApi>;
