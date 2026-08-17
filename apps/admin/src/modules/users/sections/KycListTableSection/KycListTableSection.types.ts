import type { AdminKycRequest } from "@repo/api";

export type KycListTableSectionProps = {
  items: AdminKycRequest[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onReview: (row: AdminKycRequest) => void;
  className?: string;
};
