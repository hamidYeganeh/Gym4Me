import type { PointTransactionItem } from "@repo/api";

export type PointsLedgerTableSectionProps = {
  items: PointTransactionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  className?: string;
};
