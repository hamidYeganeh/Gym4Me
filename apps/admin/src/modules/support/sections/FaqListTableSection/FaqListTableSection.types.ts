import type { AdminFaqItem } from "@repo/api";

export type FaqListTableSectionProps = {
  items: AdminFaqItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  className?: string;
};

export type FaqTableMeta = {
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  actionsClassName: string;
};
