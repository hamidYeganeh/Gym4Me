import type { CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type AchievementCardVariant = "polygon";

/** Theme color for the frame stroke, fill tint, icon, and badge. */
export type AchievementCardColor =
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "red"
  | "orange"
  | "blue"
  | "yellow"
  | "purple";

export type AchievementCardProps = Omit<
  CardProps,
  "children" | "title" | "variant" | "color"
> & {
  /** Shape / layout style. Defaults to `polygon`. */
  variant?: AchievementCardVariant;
  /**
   * Theme color for the badge.
   * Semantic: `accent` | `danger` | `success` | `warning`
   * Stats: `red` | `orange` | `blue` | `yellow` | `purple`
   * Defaults to `accent`.
   */
  color?: AchievementCardColor;
  /** Central achievement icon. Defaults to BarbellDiagonal. */
  icon?: ReactNode;
  /** Icon pinned to the bottom vertex. Defaults to the app Logo. */
  badgeIcon?: ReactNode;
};
