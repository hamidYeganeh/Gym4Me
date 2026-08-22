import type { MobileReleasePolicy } from "@repo/api";

export type ReleasePoliciesTableSectionProps = {
  items: MobileReleasePolicy[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (row: MobileReleasePolicy) => void;
};
