import type { MyAchievement } from "@repo/api";

export type AchievementsGridSectionProps = {
  achievements: MyAchievement[];
  className?: string;
};

export const ACHIEVEMENT_TAG_VARIANTS = [
  "polygon",
  "shield1",
  "star1",
  "circular",
  "octagon",
  "diamond",
] as const;

export const ACHIEVEMENT_TAG_COLORS = [
  "warning",
  "accent",
  "success",
  "purple",
  "blue",
  "orange",
] as const;
