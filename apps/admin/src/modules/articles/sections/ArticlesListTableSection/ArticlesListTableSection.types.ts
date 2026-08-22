import type { AdminArticle } from "@repo/api";

export type ArticlesListTableSectionProps = {
  items: AdminArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  className?: string;
};

export type ArticlesTableMeta = {
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  actionsClassName: string;
};
