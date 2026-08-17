import type { AdminArticle } from "@repo/api";

export type ArticlesListTableSectionProps = {
  items: AdminArticle[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  className?: string;
};

export type ArticlesTableMeta = {
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  actionsClassName: string;
};
