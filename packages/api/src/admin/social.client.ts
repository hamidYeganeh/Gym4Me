import type { ApiClient } from "../client";
import { adminSocialEndpoints as ep } from "./social.endpoint";
import type {
  AdminSocialReportsPage,
  ListAdminSocialReportsQuery,
  ResolveSocialReportInput,
  SocialReport,
} from "./social.dto";

export function createAdminSocialApi(client: ApiClient) {
  return {
    listReports(query: ListAdminSocialReportsQuery = {}) {
      return client.request<AdminSocialReportsPage>(ep.reports, { query });
    },

    resolveReport(id: string, input: ResolveSocialReportInput) {
      return client.request<SocialReport>(ep.resolveReport(id), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AdminSocialApi = ReturnType<typeof createAdminSocialApi>;
