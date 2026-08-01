import type { CoachCalendarDay } from "../../lib/calendar-daily-data";

export type CoachCalendarDailyDatePickerSectionProps = {
  days: CoachCalendarDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  dayLabels: Record<CoachCalendarDay["dayKey"], string>;
};
