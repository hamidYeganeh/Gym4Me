import type { AdminPointRule } from "@repo/api";

export type PointRulesListTableSectionProps = {
  items: AdminPointRule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  className?: string;
};

export type PointRulesTableMeta = {
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  actionsClassName: string;
};
