import type {
  CoachCalendarWeekDay,
  CoachCalendarWeekDayKey,
} from "../../lib/calendar-weekly-data";

export type CoachCalendarWeeklyDaysSectionProps = {
  days: CoachCalendarWeekDay[];
  dayLabels: Record<CoachCalendarWeekDayKey, string>;
  addLabel: string;
  menuLabel: string;
  deleteLabel: string;
  vaporizingWorkoutId?: string | null;
  onAddDay?: (dayId: string) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  onVaporizeComplete?: (workoutId: string) => void;
  onWorkoutPress?: (workoutId: string) => void;
};
