/** Club memberships — athlete (`/account/memberships`) + owner club scopes. */
export const accountMembershipsEndpoints = {
  mine: "/account/memberships",
  mineById: (id: string) => `/account/memberships/${id}`,
  purchase: "/account/memberships",
  /** Public (unauthenticated) plan catalog for athletes browsing a club. */
  discoveryPlans: (clubId: string) =>
    `/discovery/clubs/${clubId}/membership-plans`,
  discoveryPlan: (clubId: string, planId: string) =>
    `/discovery/clubs/${clubId}/membership-plans/${planId}`,
  discoveryPlatformPlans: "/discovery/platform-plans",
  clubPlans: (clubId: string) => `/account/clubs/${clubId}/membership-plans`,
  clubPlan: (clubId: string, planId: string) =>
    `/account/clubs/${clubId}/membership-plans/${planId}`,
  clubMemberships: (clubId: string) => `/account/clubs/${clubId}/memberships`,
  clubMembership: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}`,
  sell: (clubId: string) => `/account/clubs/${clubId}/memberships`,
  import: (clubId: string) => `/account/clubs/${clubId}/memberships/import`,
  freeze: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/freeze`,
  unfreeze: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/unfreeze`,
  transfer: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/transfer`,
  cancel: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/cancel`,
  consume: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/consume`,
  // ── Platform SaaS subscriptions ───────────────────────────────────────────
  platformPlans: "/account/platform-plans",
  platformSubscriptions: "/account/platform-subscriptions",
  cancelPlatformSubscription: (subscriptionId: string) =>
    `/account/platform-subscriptions/${subscriptionId}/cancel`,
} as const;
