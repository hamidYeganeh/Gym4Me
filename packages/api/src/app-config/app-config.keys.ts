import type { FetchBootstrapQuery } from "./app-config.dto";
import type { ListAppConfigQuery } from "./app-config.client";

export const appConfigKeys = {
  all: ["app-config"] as const,
  bootstrap: (query: FetchBootstrapQuery) =>
    [...appConfigKeys.all, "bootstrap", query] as const,
  featureFlags: (query: ListAppConfigQuery = {}) =>
    [...appConfigKeys.all, "feature-flags", query] as const,
  releasePolicies: (query: ListAppConfigQuery = {}) =>
    [...appConfigKeys.all, "release-policies", query] as const,
};
