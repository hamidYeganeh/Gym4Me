export const appConfigEndpoints = {
  bootstrap: "/app-config/bootstrap",
  featureFlags: "/admin/app-config/feature-flags",
  featureFlag: (key: string) =>
    `/admin/app-config/feature-flags/${encodeURIComponent(key)}`,
  releasePolicies: "/admin/app-config/release-policies",
} as const;
