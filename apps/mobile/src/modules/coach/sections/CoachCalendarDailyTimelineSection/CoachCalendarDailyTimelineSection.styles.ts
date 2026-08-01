export const coachCalendarDailyTimelineSectionStyles = {
  root: "relative flex flex-col gap-5 px-screen pb-28 pt-2",
  line: "pointer-events-none absolute inset-y-2 start-[calc(var(--screen-margin)+28px)] w-px bg-border",
  row: "relative grid grid-cols-[56px_minmax(0,1fr)] items-start gap-3",
  timeWrap: "relative z-10 flex justify-center pt-4",
  time: [
    "inline-flex min-w-11 max-w-14 items-center justify-center rounded-full",
    "bg-surface-secondary px-1.5 py-1 text-center",
    "text-[10px] font-medium leading-tight text-muted",
  ].join(" "),
  cardWrap: "min-w-0",
} as const;
