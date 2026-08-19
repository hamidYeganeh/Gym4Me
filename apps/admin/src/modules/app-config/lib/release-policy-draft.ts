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
    releaseNotes: { title: "", features: [""] },
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
    releaseNotes: row.releaseNotes
      ? {
          title: row.releaseNotes.title,
          features:
            row.releaseNotes.features.length > 0
              ? [...row.releaseNotes.features]
              : [""],
        }
      : { title: "", features: [""] },
    enabled: row.enabled,
    reason: "",
  };
}

/** Omit empty Whats New from the upsert payload. */
export function releaseNotesForUpsert(
  draft: UpsertReleasePolicyInput,
): UpsertReleasePolicyInput["releaseNotes"] | undefined {
  const title = draft.releaseNotes?.title.trim() ?? "";
  const features = (draft.releaseNotes?.features ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  if (!title || features.length === 0) return undefined;
  return { title, features };
}
