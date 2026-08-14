import type { MobileReleasePolicy } from "@repo/api";

export type ReleasePoliciesTableSectionProps = {
  items: MobileReleasePolicy[];
  loading: boolean;
  error: string | null;
  onEdit: (row: MobileReleasePolicy) => void;
};
