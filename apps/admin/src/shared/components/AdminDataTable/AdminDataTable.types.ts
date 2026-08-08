import type { ReactNode } from "react";
import type { ColumnDef, TableMeta } from "@tanstack/react-table";

export type AdminDataTableProps<TData, TMeta = TableMeta<TData>> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  getRowId: (row: TData) => string;
  ariaLabel: string;
  emptyLabel: string;
  loadingLabel: string;
  loadingMoreLabel?: string;
  summaryLabel?: string;
  error?: string | null;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  estimateRowHeight?: number;
  meta?: TMeta;
  toolbar?: ReactNode;
  className?: string;
};
