import type { GamificationSubjectType } from "@repo/api";

export type AchievementsListHeaderSectionProps = {
  audienceFilter: GamificationSubjectType | "all";
  onAudienceChange: (value: GamificationSubjectType | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
