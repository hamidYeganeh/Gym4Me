import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  DiscoveryClass,
  DiscoveryClassesQuery,
} from "./classes.dto";
import { discoveryClassesEndpoints as ep } from "./classes.endpoint";

/** Public discovery classes (`/discovery/classes`). */
export function createDiscoveryClassesApi(client: ApiClient) {
  return {
    list(query: DiscoveryClassesQuery = {}) {
      return client.request<Paginated<DiscoveryClass>>(ep.root, {
        query,
        public: true,
      });
    },

    get(classId: string) {
      return client.request<DiscoveryClass>(ep.byId(classId), {
        public: true,
      });
    },
  };
}

export type DiscoveryClassesApi = ReturnType<typeof createDiscoveryClassesApi>;
