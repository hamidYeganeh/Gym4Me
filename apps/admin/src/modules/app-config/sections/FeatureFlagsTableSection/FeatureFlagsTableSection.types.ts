import type { FeatureFlag } from "@repo/api";

export type FeatureFlagsTableSectionProps = {
  items: FeatureFlag[];
  loading: boolean;
  error: string | null;
  onEdit: (row: FeatureFlag) => void;
  onPause: (row: FeatureFlag) => void;
  onActivate: (row: FeatureFlag) => void;
};
