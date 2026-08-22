import type { SupportTicket } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";

export type SupportTicketsTableSectionProps = {
  items: SupportTicket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onView: (row: SupportTicket) => void;
  className?: string;
};

export type SupportTicketsTableMeta = {
  actionsClassName: string;
  onView: (row: SupportTicket) => void;
};

export type { ColumnDef };
