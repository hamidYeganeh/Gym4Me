import type { ApiClient } from "../client";
import { adminMembershipsEndpoints as ep } from "./memberships.endpoint";
import type {
  AdminPlatformPlansPage,
  AdminPlatformSubscriptionsPage,
  CreatePlatformPlanInput,
  ListAdminPlatformPlansQuery,
  ListAdminPlatformSubscriptionsQuery,
  PlatformPlan,
  UpdatePlatformPlanInput,
} from "./memberships.dto";

/** Admin platform plan catalog + subscription oversight. */
export function createAdminMembershipsApi(client: ApiClient) {
  return {
    listPlatformPlans(query: ListAdminPlatformPlansQuery = {}) {
      return client.request<AdminPlatformPlansPage>(ep.platformPlans, {
        query,
      });
    },

    getPlatformPlan(planId: string) {
      return client.request<PlatformPlan>(ep.platformPlan(planId));
    },

    createPlatformPlan(input: CreatePlatformPlanInput) {
      return client.request<PlatformPlan>(ep.platformPlans, {
        method: "POST",
        body: input,
      });
    },

    updatePlatformPlan(planId: string, input: UpdatePlatformPlanInput) {
      return client.request<PlatformPlan>(ep.platformPlan(planId), {
        method: "PATCH",
        body: input,
      });
    },

    archivePlatformPlan(planId: string) {
      return client.request<PlatformPlan>(ep.platformPlan(planId), {
        method: "DELETE",
      });
    },

    listPlatformSubscriptions(
      query: ListAdminPlatformSubscriptionsQuery = {},
    ) {
      return client.request<AdminPlatformSubscriptionsPage>(
        ep.platformSubscriptions,
        { query },
      );
    },
  };
}

export type AdminMembershipsApi = ReturnType<typeof createAdminMembershipsApi>;
