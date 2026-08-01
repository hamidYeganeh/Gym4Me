export type CoachCalendarWeeklyWeekNavSectionProps = {
  rangeLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
};
