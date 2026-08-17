import type { AdminBanner } from "@repo/api";

export type BannersListTableSectionProps = {
  items: AdminBanner[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  className?: string;
};

export type BannerTableMeta = {
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  actionsClassName: string;
};
