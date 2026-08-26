/** Club memberships — athlete (`/account/memberships`) + owner club scopes. */
export const accountMembershipsEndpoints = {
  mine: "/account/memberships",
  mineById: (id: string) => `/account/memberships/${id}`,
  purchase: "/account/memberships",
  checkoutPreview: "/account/memberships/checkouts/preview",
  checkoutInitiate: "/account/memberships/checkouts/initiate",
  checkoutVerify: (checkoutId: string) =>
    `/account/memberships/checkouts/${checkoutId}/verify`,
  mineRenewalPreview: (membershipId: string) =>
    `/account/memberships/${membershipId}/renewal-preview`,
  /** Public (unauthenticated) plan catalog for athletes browsing a club. */
  discoveryPlans: (clubId: string) =>
    `/discovery/clubs/${clubId}/membership-plans`,
  discoveryPlan: (clubId: string, planId: string) =>
    `/discovery/clubs/${clubId}/membership-plans/${planId}`,
  discoveryPlatformPlans: "/discovery/platform-plans",
  discoveryPlanSummaries: "/discovery/membership-plan-summaries",
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
  renewalPreview: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/renewal-preview`,
  renew: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/renew`,
  consume: (clubId: string, membershipId: string) =>
    `/account/clubs/${clubId}/memberships/${membershipId}/consume`,
  // ── Platform SaaS subscriptions ───────────────────────────────────────────
  platformPlans: "/account/platform-plans",
  platformSubscriptions: "/account/platform-subscriptions",
  platformEntitlements:
    "/account/platform-subscriptions/entitlements/current",
  platformSubscriptionCheckoutPreview:
    "/account/platform-subscriptions/checkouts/preview",
  platformSubscriptionCheckoutInitiate:
    "/account/platform-subscriptions/checkouts/initiate",
  platformSubscriptionCheckoutVerify: (checkoutId: string) =>
    `/account/platform-subscriptions/checkouts/${checkoutId}/verify`,
  cancelPlatformSubscription: (subscriptionId: string) =>
    `/account/platform-subscriptions/${subscriptionId}/cancel`,
  schedulePlatformPlanChange: (subscriptionId: string) =>
    `/account/platform-subscriptions/${subscriptionId}/plan-change`,
} as const;
