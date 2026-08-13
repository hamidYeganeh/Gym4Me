import type { ApiClient } from "../client";
import { adminAnalyticsEndpoints as ep } from "./analytics.endpoint";
import type { AdminAnalyticsOverview } from "./analytics.dto";

/** Platform KPI overview for the admin dashboard. */
export function createAdminAnalyticsApi(client: ApiClient) {
  return {
    overview() {
      return client.request<AdminAnalyticsOverview>(ep.overview);
    },
  };
}

export type AdminAnalyticsApi = ReturnType<typeof createAdminAnalyticsApi>;
