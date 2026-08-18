import type { MyAchievement } from "@repo/api";

export type BaseProfileHighlightsSectionProps = {
  inviteHref?: string | null;
  streakHref: string;
  streakDays?: number | null;
  achievementsHref: string;
  achievements: MyAchievement[];
  achievementsTotal: number;
  className?: string;
};
