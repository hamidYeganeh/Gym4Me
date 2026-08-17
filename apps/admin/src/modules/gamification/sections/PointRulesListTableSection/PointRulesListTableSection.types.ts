import type { AdminPointRule } from "@repo/api";

export type PointRulesListTableSectionProps = {
  items: AdminPointRule[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  className?: string;
};

export type PointRulesTableMeta = {
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  actionsClassName: string;
};
