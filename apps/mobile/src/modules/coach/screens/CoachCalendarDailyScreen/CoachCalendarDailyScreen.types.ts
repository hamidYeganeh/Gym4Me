import type {
  CoachCalendarDailyWorkout,
  CoachCalendarDay,
  CoachCalendarTimeSlot,
} from "../../lib/calendar-daily-data";

export type CoachCalendarDailyScreenProps = {
  days: CoachCalendarDay[];
  slots: CoachCalendarTimeSlot[];
  workouts: CoachCalendarDailyWorkout[];
  /** When set, timeline follows the selected day. */
  workoutsByDayId?: Record<string, CoachCalendarDailyWorkout[]>;
  defaultDayId: string;
};
