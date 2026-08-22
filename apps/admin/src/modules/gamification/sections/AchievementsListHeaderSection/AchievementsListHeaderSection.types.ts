import type { EntityStatus, GamificationSubjectType } from "@repo/api";

export type AchievementsListHeaderSectionProps = {
  audienceFilter: GamificationSubjectType | "all";
  statusFilter: EntityStatus | "all";
  onAudienceChange: (value: GamificationSubjectType | "all") => void;
  onStatusChange: (value: EntityStatus | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  onImportDefaults?: () => void;
  importDefaultsPending?: boolean;
  className?: string;
};
