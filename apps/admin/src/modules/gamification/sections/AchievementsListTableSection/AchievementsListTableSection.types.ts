import type { AdminAchievement } from "@repo/api";

export type AchievementsListTableSectionProps = {
  items: AdminAchievement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onEdit: (row: AdminAchievement) => void;
  onGrant: (row: AdminAchievement) => void;
  onArchive: (row: AdminAchievement) => void;
  className?: string;
};

export type AchievementTableMeta = {
  actionsClassName: string;
  onEdit: (row: AdminAchievement) => void;
  onGrant: (row: AdminAchievement) => void;
  onArchive: (row: AdminAchievement) => void;
};
