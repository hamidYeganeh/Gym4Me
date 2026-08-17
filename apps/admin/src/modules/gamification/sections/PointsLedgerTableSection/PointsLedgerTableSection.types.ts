import type { PointTransactionItem } from "@repo/api";

export type PointsLedgerTableSectionProps = {
  items: PointTransactionItem[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  className?: string;
};
