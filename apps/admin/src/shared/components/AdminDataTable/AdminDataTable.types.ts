import type { ReactNode } from "react";
import type { ColumnDef, TableMeta } from "@tanstack/react-table";

export type AdminDataTableSort = {
  column: string;
  direction: "ascending" | "descending";
};

export type AdminDataTablePagination = {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
};

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
  sort?: AdminDataTableSort;
  onSortChange?: (sort: AdminDataTableSort) => void;
  pagination?: AdminDataTablePagination;
  meta?: TMeta;
  toolbar?: ReactNode;
  className?: string;
};
