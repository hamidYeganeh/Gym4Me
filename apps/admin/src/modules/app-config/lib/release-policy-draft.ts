import type {
  MobileReleasePolicy,
  UpsertReleasePolicyInput,
} from "@repo/api";

export function emptyReleasePolicyDraft(): UpsertReleasePolicyInput {
  return {
    platform: "android",
    channel: "production",
    latestAppVersion: "0.1.0",
    minimumSupportedAppVersion: "0.1.0",
    recommendedApiVersion: "1",
    updateUrl: "",
    enabled: true,
    reason: "",
  };
}

export function policyToDraft(
  row: MobileReleasePolicy,
): UpsertReleasePolicyInput {
  return {
    platform: row.platform,
    channel: row.channel,
    latestAppVersion: row.latestAppVersion,
    minimumSupportedAppVersion: row.minimumSupportedAppVersion,
    recommendedApiVersion: row.recommendedApiVersion,
    updateUrl: row.updateUrl ?? "",
    enabled: row.enabled,
    reason: "",
  };
}
