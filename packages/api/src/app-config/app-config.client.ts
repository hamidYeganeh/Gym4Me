import type { ApiClient } from "../client";
import type {
  AppBootstrap,
  FeatureFlag,
  FetchBootstrapQuery,
  MobileReleasePolicy,
  UpsertFeatureFlagInput,
  UpsertReleasePolicyInput,
} from "./app-config.dto";
import { appConfigEndpoints as ep } from "./app-config.endpoint";

export function createAppConfigApi(client: ApiClient) {
  return {
    fetchBootstrap(query: FetchBootstrapQuery) {
      return client.request<AppBootstrap>(ep.bootstrap, {
        public: true,
        versionNeutral: true,
        query,
      });
    },

    listFeatureFlags() {
      return client.request<FeatureFlag[]>(ep.featureFlags);
    },

    upsertFeatureFlag(key: string, input: UpsertFeatureFlagInput) {
      return client.request<FeatureFlag>(ep.featureFlag(key), {
        method: "PUT",
        body: input,
      });
    },

    listReleasePolicies() {
      return client.request<MobileReleasePolicy[]>(ep.releasePolicies);
    },

    upsertReleasePolicy(input: UpsertReleasePolicyInput) {
      return client.request<MobileReleasePolicy>(ep.releasePolicies, {
        method: "PUT",
        body: input,
      });
    },
  };
}

export type AppConfigApi = ReturnType<typeof createAppConfigApi>;
