import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";

export type NotificationCardAction = {
  /** Button label. */
  label: ReactNode;
  /** Called when the action is pressed. */
  onPress?: ButtonProps["onPress"];
  /** Accessible name when `label` is not a string. */
  actionLabel?: string;
};

export type NotificationCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Bold headline. */
  title: ReactNode;
  /** Supporting body copy under the title (or under progress when set). */
  description?: ReactNode;
  /** Relative time shown top-end (e.g. "1h ago"). */
  timestamp?: ReactNode;
  /** Leading icon. Defaults to a bell. */
  icon?: ReactNode;
  /** Pill badge under the description. */
  badge?: ReactNode;
  /** Optional leading glyph inside the badge. Defaults to a hollow ring. */
  badgeIcon?: ReactNode;
  /** Progress 0–100. When set, a bar renders between title and description. */
  progress?: number;
  /** Accessible label for the progress bar. */
  progressLabel?: string;
  /** Accent text action (e.g. "Primary"). */
  primaryAction?: NotificationCardAction;
  /** Neutral text action (e.g. "Secondary"). */
  secondaryAction?: NotificationCardAction;
  /** Nested media / rich content shown in a bordered frame. */
  children?: ReactNode;
};
