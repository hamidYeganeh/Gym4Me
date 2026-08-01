import type { ReactNode } from "react";

export type MetricGoalCardProps = {
  goalValue: ReactNode;
  goalLabel: ReactNode;
  description: ReactNode;
  /** Progress 0–100. */
  progress: number;
  progressLabel: ReactNode;
  currentLabel: ReactNode;
  editLabel: ReactNode;
  onEdit?: () => void;
  icon?: ReactNode;
  className?: string;
};
