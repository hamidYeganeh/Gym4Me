import type { Payout } from "@repo/api";

export type PayoutsListTableSectionProps = {
  items: Payout[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
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
