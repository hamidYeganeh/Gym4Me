import type { AdminAchievement, GamificationSubjectType } from "@repo/api";

export type AchievementsListModalsSectionProps = {
  granting: AdminAchievement | null;
  onGrantingOpenChange: (open: boolean) => void;
  grantSubjectType: GamificationSubjectType;
  onGrantSubjectTypeChange: (value: GamificationSubjectType) => void;
  grantSubjectId: string;
  onGrantSubjectIdChange: (value: string) => void;
  grantPending: boolean;
  grantError: string | null;
  grantDone: boolean;
  onGrantConfirm: () => void;
  archiving: AdminAchievement | null;
  onArchivingOpenChange: (open: boolean) => void;
  archivePending: boolean;
  archiveError: string | null;
  onArchiveConfirm: () => void;
};
