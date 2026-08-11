import type { ApiClient } from "../client";
import type { AnalyticsPeriod } from "../finance/finance.dto";
import type {
  CoachAnalyticsOverview,
  ListStudentsQuery,
  StudentsPage,
} from "./coaching.dto";
import { accountCoachingEndpoints as ep } from "./coaching.endpoint";

export function createAccountCoachingApi(client: ApiClient) {
  return {
    listStudents(query: ListStudentsQuery = {}) {
      return client.request<StudentsPage>(ep.students, { query });
    },

    analyticsOverview(period?: AnalyticsPeriod) {
      return client.request<CoachAnalyticsOverview>(ep.analyticsOverview, {
        query: period ? { period } : undefined,
      });
    },
  };
}

export type AccountCoachingApi = ReturnType<typeof createAccountCoachingApi>;
