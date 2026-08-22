import type { AdminBanner } from "@repo/api";

export type BannersListTableSectionProps = {
  items: AdminBanner[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  className?: string;
};

export type BannerTableMeta = {
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  actionsClassName: string;
};
