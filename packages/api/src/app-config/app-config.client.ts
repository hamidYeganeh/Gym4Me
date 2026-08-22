import type { ApiClient } from "../client";
import type { ListQuery, Paginated } from "../types";
import type {
  AppBootstrap,
  FeatureFlag,
  FetchBootstrapQuery,
  MobileReleasePolicy,
  UpsertFeatureFlagInput,
  UpsertReleasePolicyInput,
} from "./app-config.dto";
import { appConfigEndpoints as ep } from "./app-config.endpoint";

export type ListAppConfigQuery = ListQuery & {
  search?: string;
};

export function createAppConfigApi(client: ApiClient) {
  return {
    fetchBootstrap(query: FetchBootstrapQuery) {
      return client.request<AppBootstrap>(ep.bootstrap, {
        public: true,
        versionNeutral: true,
        query,
      });
    },

    listFeatureFlags(query: ListAppConfigQuery = {}) {
      return client.request<Paginated<FeatureFlag>>(ep.featureFlags, {
        query,
      });
    },

    upsertFeatureFlag(key: string, input: UpsertFeatureFlagInput) {
      return client.request<FeatureFlag>(ep.featureFlag(key), {
        method: "PUT",
        body: input,
      });
    },

    listReleasePolicies(query: ListAppConfigQuery = {}) {
      return client.request<Paginated<MobileReleasePolicy>>(ep.releasePolicies, {
        query,
      });
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
