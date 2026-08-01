export const coachCalendarDailyDatePickerSectionStyles = {
  root: "flex gap-2 overflow-x-auto px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  day: "relative shrink-0 flex-col gap-0.5",
  dayLetter: "text-[11px] font-medium leading-none",
  dayNumber: "text-sm font-bold leading-none tabular-nums",
  dot: "absolute bottom-1 size-1 rounded-full bg-accent",
} as const;
