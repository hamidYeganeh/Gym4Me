import type { SupportTicket } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";

export type SupportTicketsTableSectionProps = {
  items: SupportTicket[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onView: (row: SupportTicket) => void;
  className?: string;
};

export type SupportTicketsTableMeta = {
  actionsClassName: string;
  onView: (row: SupportTicket) => void;
};

export type { ColumnDef };
