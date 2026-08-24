import type { ApiClient } from "../client";
import type { DiscoveryFeedQuery, DiscoveryFeedResponse } from "./feed.dto";
import { discoveryFeedEndpoints as ep } from "./feed.endpoint";

/** Optional-auth composable discovery feed. */
export function createDiscoveryFeedApi(client: ApiClient) {
  return {
    get(query: DiscoveryFeedQuery = {}) {
      return client.request<DiscoveryFeedResponse>(ep.root, { query });
    },
  };
}

export type DiscoveryFeedApi = ReturnType<typeof createDiscoveryFeedApi>;
