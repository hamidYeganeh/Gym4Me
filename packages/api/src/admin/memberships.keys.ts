import type {
  ListAdminPlatformPlansQuery,
  ListAdminPlatformSubscriptionsQuery,
} from "./memberships.dto";

export const adminMembershipsKeys = {
  all: ["admin", "memberships"] as const,
  platformPlans: (query: ListAdminPlatformPlansQuery = {}) =>
    [...adminMembershipsKeys.all, "platform-plans", query] as const,
  platformPlan: (planId: string) =>
    [...adminMembershipsKeys.all, "platform-plan", planId] as const,
  platformSubscriptions: (
    query: ListAdminPlatformSubscriptionsQuery = {},
  ) =>
    [...adminMembershipsKeys.all, "platform-subscriptions", query] as const,
};
