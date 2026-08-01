import type {
  CoachCalendarDailyWorkout,
  CoachCalendarTimeSlot,
} from "../../lib/calendar-daily-data";
import type { ScheduleWorkoutIntensity } from "@repo/ui/cards/ScheduleWorkoutCard";

export type CoachCalendarDailyTimelineSectionProps = {
  slots: CoachCalendarTimeSlot[];
  workouts: CoachCalendarDailyWorkout[];
  intensityLabels: Record<ScheduleWorkoutIntensity, string>;
  deleteLabel: string;
  openWorkoutId?: string | null;
  onOpenChange: (workoutId: string | null) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onWorkoutPress?: (workoutId: string) => void;
};
