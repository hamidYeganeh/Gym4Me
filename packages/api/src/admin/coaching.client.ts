import type { ApiClient } from "../client";
import { adminCoachingEndpoints as ep } from "./coaching.endpoint";
import type {
  AdminCoachServicesPage,
  AdminCoachStudentsPage,
  AdminHealthAssessment,
  AdminListCoachingQuery,
  AdminSessionPackagesPage,
} from "./coaching.dto";

/** Platform coaching oversight listings. */
export function createAdminCoachingApi(client: ApiClient) {
  return {
    listServices(query: AdminListCoachingQuery = {}) {
      return client.request<AdminCoachServicesPage>(ep.services, { query });
    },

    listPackages(query: AdminListCoachingQuery = {}) {
      return client.request<AdminSessionPackagesPage>(ep.packages, { query });
    },

    listStudents(query: AdminListCoachingQuery = {}) {
      return client.request<AdminCoachStudentsPage>(ep.students, { query });
    },

    getHealthAssessment(athleteUserId: string) {
      return client.request<AdminHealthAssessment>(
        ep.healthAssessment(athleteUserId),
      );
    },
  };
}

export type AdminCoachingApi = ReturnType<typeof createAdminCoachingApi>;
