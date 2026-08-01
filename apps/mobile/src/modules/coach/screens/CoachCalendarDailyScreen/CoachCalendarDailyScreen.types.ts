import type {
  CoachCalendarDailyWorkout,
  CoachCalendarDay,
  CoachCalendarTimeSlot,
} from "../../lib/calendar-daily-data";

export type CoachCalendarDailyScreenProps = {
  days: CoachCalendarDay[];
  slots: CoachCalendarTimeSlot[];
  workouts: CoachCalendarDailyWorkout[];
  defaultDayId: string;
};
