import type { FeatureFlag } from "@repo/api";

export type FeatureFlagsTableSectionProps = {
  items: FeatureFlag[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (row: FeatureFlag) => void;
  onPause: (row: FeatureFlag) => void;
  onActivate: (row: FeatureFlag) => void;
};
