import type { ReactNode } from "react";

export type MetricHistoryItemProps = {
  value: ReactNode;
  time: ReactNode;
  /** Secondary line under the value (e.g. steps / goal status). */
  subtitle?: ReactNode;
  /** Optional alert line under the subtitle. */
  alert?: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  /** Enables swipe-to-reveal delete. */
  onDelete?: () => void;
  deleteLabel?: string;
  /** Controlled open state for swipe actions (only one open at a time). */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Accessible label for the row button. */
  "aria-label"?: string;
  className?: string;
};
