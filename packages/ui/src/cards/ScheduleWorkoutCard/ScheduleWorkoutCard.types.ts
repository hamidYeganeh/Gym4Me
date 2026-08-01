import type { ReactNode } from "react";

export type ScheduleWorkoutIntensity = "intense" | "normal" | "extreme";

export type ScheduleWorkoutCardTrailing = "chevron" | "menu";

export type ScheduleWorkoutCardProps = {
  title: ReactNode;
  duration: ReactNode;
  category: ReactNode;
  image?: string;
  imageAlt?: string;
  intensity?: ScheduleWorkoutIntensity;
  intensityLabel?: ReactNode;
  trailing?: ScheduleWorkoutCardTrailing;
  onPress?: () => void;
  onMenuPress?: () => void;
  menuLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  "aria-label"?: string;
  className?: string;
};
