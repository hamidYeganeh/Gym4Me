import type { IconProps } from "@repo/icons";
import type { ComponentType } from "react";

export type WelcomeAchievementTone = "orange" | "blue" | "silver";

export type WelcomeAchievementBadgeShape = "hex" | "shield";

export type WelcomeAchievementCardProps = {
  className?: string;
  title: string;
  status: string;
  tone: WelcomeAchievementTone;
  badgeShape?: WelcomeAchievementBadgeShape;
  icon: ComponentType<IconProps>;
};
