import type { Payout } from "@repo/api";

export type PayoutsListTableSectionProps = {
  items: Payout[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onSettle: (row: Payout) => void;
  onDispute: (row: Payout) => void;
  onResolve: (row: Payout) => void;
  className?: string;
};

export type PayoutTableMeta = {
  actionsClassName: string;
  onSettle: (row: Payout) => void;
  onDispute: (row: Payout) => void;
  onResolve: (row: Payout) => void;
};
