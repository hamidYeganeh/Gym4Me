export type AppPlatform = "ios" | "android" | "web";
export type ReleaseChannel = "production" | "beta" | "development";
export type FeatureFlagStatus = "draft" | "active" | "paused" | "archived";

export type FeatureFlagRule = {
  platforms: AppPlatform[];
  channels: ReleaseChannel[];
  minAppVersion: string | null;
  maxAppVersion: string | null;
  rolloutPercentage: number;
  variant: string;
};

export type FeatureFlag = {
  id: string;
  key: string;
  status: FeatureFlagStatus;
  rolloutPercentage: number;
  platforms: AppPlatform[];
  channels: ReleaseChannel[];
  minimumAppVersion: string | null;
  maximumAppVersion: string | null;
  rules: FeatureFlagRule[];
  defaultVariant: string | null;
  payload: Record<string, unknown>;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MobileReleasePolicy = {
  id: string;
  platform: AppPlatform;
  channel: ReleaseChannel;
  latestAppVersion: string;
  minimumSupportedAppVersion: string;
  recommendedApiVersion: string;
  updateUrl: string | null;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AppBootstrapFeature = {
  enabled: boolean;
  variant?: string;
  payload: Record<string, unknown>;
};

export type AppBootstrap = {
  schemaVersion: 1;
  serverTime: string;
  cacheTtlSeconds: number;
  api: { currentVersion: string; recommendedVersion: string };
  compatibility: {
    supported: boolean;
    updateRequired: boolean;
    updateAvailable: boolean;
    minimumAppVersion: string;
    latestAppVersion: string;
    updateUrl: string | null;
  };
  features: Record<string, AppBootstrapFeature>;
};

export type FetchBootstrapQuery = {
  platform: AppPlatform;
  appVersion: string;
  buildNumber?: string;
  installationId?: string;
  channel?: ReleaseChannel;
};

export type FeatureFlagRuleInput = {
  platforms: AppPlatform[];
  channels: ReleaseChannel[];
  minAppVersion?: string;
  maxAppVersion?: string;
  rolloutPercentage: number;
  variant: string;
};

export type UpsertFeatureFlagInput = {
  status: FeatureFlagStatus;
  rolloutPercentage: number;
  platforms: AppPlatform[];
  channels: ReleaseChannel[];
  minimumAppVersion?: string;
  maximumAppVersion?: string;
  rules?: FeatureFlagRuleInput[];
  defaultVariant?: string;
  payload?: Record<string, unknown>;
  description?: string;
  reason: string;
};

export type UpsertReleasePolicyInput = {
  platform: AppPlatform;
  channel?: ReleaseChannel;
  latestAppVersion: string;
  minimumSupportedAppVersion: string;
  recommendedApiVersion: string;
  updateUrl?: string;
  enabled: boolean;
  reason: string;
};
