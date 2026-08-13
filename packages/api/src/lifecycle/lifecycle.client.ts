import type { ApiClient } from "../client";
import type {
  AtRiskMembersResponse,
  EnrollJourneysResult,
  LifecycleJourneysResponse,
  LifecycleSegmentsResponse,
  RunJourneysResult,
} from "./lifecycle.dto";
import { accountLifecycleEndpoints as ep } from "./lifecycle.endpoint";

export function createAccountLifecycleApi(client: ApiClient) {
  return {
    listSegments(clubId: string) {
      return client.request<LifecycleSegmentsResponse>(ep.segments(clubId));
    },

    listAtRisk(clubId: string) {
      return client.request<AtRiskMembersResponse>(ep.atRisk(clubId));
    },

    listJourneys(clubId: string) {
      return client.request<LifecycleJourneysResponse>(ep.journeys(clubId));
    },

    enrollExpiring(clubId: string) {
      return client.request<EnrollJourneysResult>(ep.enrollExpiring(clubId), {
        method: "POST",
        body: {},
      });
    },

    runJourneys(clubId: string) {
      return client.request<RunJourneysResult>(ep.runJourneys(clubId), {
        method: "POST",
        body: {},
      });
    },
  };
}

export type AccountLifecycleApi = ReturnType<typeof createAccountLifecycleApi>;
