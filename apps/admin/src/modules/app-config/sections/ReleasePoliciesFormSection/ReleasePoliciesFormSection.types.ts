import type {
  AppPlatform,
  ReleaseChannel,
  UpsertReleasePolicyInput,
} from "@repo/api";

export const RELEASE_PLATFORMS: AppPlatform[] = ["ios", "android", "web"];
export const RELEASE_CHANNELS: ReleaseChannel[] = [
  "production",
  "beta",
  "development",
];

export type ReleasePoliciesFormSectionProps = {
  draft: UpsertReleasePolicyInput | null;
  isCreate: boolean;
  pending: boolean;
  error: string | null;
  onChange: (next: UpsertReleasePolicyInput) => void;
  onClose: () => void;
  onSave: () => void;
};
