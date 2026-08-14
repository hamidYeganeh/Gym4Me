import type { FeatureFlag, UpsertFeatureFlagInput } from "@repo/api";

export type FeatureFlagEditPatch = Pick<
  UpsertFeatureFlagInput,
  "status" | "rolloutPercentage" | "reason"
>;

export type FeatureFlagsEditSectionProps = {
  flag: FeatureFlag | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (patch: FeatureFlagEditPatch) => Promise<void>;
};
