import type { AdminAchievement } from "@repo/api";

export type AchievementsListTableSectionProps = {
  items: AdminAchievement[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
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
