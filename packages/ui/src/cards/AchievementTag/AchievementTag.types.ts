import type { CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type AchievementTagVariant =
  | "polygon"
  | "circular"
  | "wavy"
  | "shield1"
  | "shield2"
  | "octagon"
  | "diamond"
  | "star1"
  | "star2";

/** Theme color for the tag body, icon, and badge. */
export type AchievementTagColor =
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "red"
  | "orange"
  | "blue"
  | "yellow"
  | "purple";

export type AchievementTagSize = "sm" | "md" | "lg";

export type AchievementTagProps = Omit<
  CardProps,
  "children" | "title" | "variant" | "color" | "size"
> & {
  /** Shape / layout style. Defaults to `polygon`. */
  variant?: AchievementTagVariant;
  /**
   * Theme color for the tag.
   * Semantic: `accent` | `danger` | `success` | `warning`
   * Stats: `red` | `orange` | `blue` | `yellow` | `purple`
   * Defaults to `accent`.
   */
  color?: AchievementTagColor;
  /**
   * Tag size. Scales frame + icon together.
   * - `sm` — 75% of default
   * - `md` — default (~49×54 for polygon)
   * - `lg` — 135% of default
   */
  size?: AchievementTagSize;
  /** Central achievement icon. Defaults to BarbellDiagonal. */
  icon?: ReactNode;
  /** Icon pinned to the bottom. Defaults to the app Logo. */
  badgeIcon?: ReactNode;
};
