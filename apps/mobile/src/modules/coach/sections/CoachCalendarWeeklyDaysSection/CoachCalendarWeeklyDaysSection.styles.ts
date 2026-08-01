export const coachCalendarWeeklyDaysSectionStyles = {
  root: "flex flex-col px-screen pb-28",
  dayBlock: "border-b border-separator py-4",
  dayHeader: "flex items-center justify-between gap-3",
  dayTitle: "text-base font-bold tracking-tight text-foreground",
  // Margin (not gap) so vaporize height/margin collapse can close spacing smoothly.
  workouts: "mt-3 flex flex-col [&>:not(:last-child)]:mb-3",
} as const;
