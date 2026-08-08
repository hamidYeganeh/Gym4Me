import type { ApiClient } from "../client";
import type {
  CaptureAttributionInput,
  UserAttribution,
} from "./analytics.dto";
import { analyticsEndpoints as ep } from "./analytics.endpoint";

/** Analytics / attribution (`/analytics`). */
export function createAnalyticsApi(client: ApiClient) {
  return {
    getAttribution() {
      return client.request<UserAttribution>(ep.attribution);
    },

    captureAttribution(input: CaptureAttributionInput) {
      return client.request<UserAttribution>(ep.attribution, {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AnalyticsApi = ReturnType<typeof createAnalyticsApi>;
