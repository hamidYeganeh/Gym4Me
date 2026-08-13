/** Platform plan catalog + subscription oversight (`/admin`). */
export const adminMembershipsEndpoints = {
  platformPlans: "/admin/platform-plans",
  platformPlan: (planId: string) => `/admin/platform-plans/${planId}`,
  platformSubscriptions: "/admin/platform-subscriptions",
} as const;
