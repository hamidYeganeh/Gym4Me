import type { FetchBootstrapQuery } from "./app-config.dto";

export const appConfigKeys = {
  all: ["app-config"] as const,
  bootstrap: (query: FetchBootstrapQuery) =>
    [...appConfigKeys.all, "bootstrap", query] as const,
  featureFlags: () => [...appConfigKeys.all, "feature-flags"] as const,
  releasePolicies: () => [...appConfigKeys.all, "release-policies"] as const,
};
