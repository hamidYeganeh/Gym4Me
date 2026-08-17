import type { AdminFaqItem } from "@repo/api";

export type FaqListTableSectionProps = {
  items: AdminFaqItem[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  className?: string;
};

export type FaqTableMeta = {
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  actionsClassName: string;
};
