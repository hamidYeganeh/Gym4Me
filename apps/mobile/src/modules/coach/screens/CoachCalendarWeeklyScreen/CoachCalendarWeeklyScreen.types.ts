import type { CoachCalendarWeek } from "../../lib/calendar-weekly-data";

export type CoachCalendarWeeklyScreenProps = {
  weeks: CoachCalendarWeek[];
  defaultWeekIndex?: number;
};
