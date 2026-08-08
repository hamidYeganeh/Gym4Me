import { tv } from "tailwind-variants";

export const discoveryClubsDetailCalendarSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex items-center justify-between gap-3",
    title: "min-w-0 flex-1 text-foreground",
    nav: [
      "flex items-center justify-between gap-2 rounded-[1.5rem]",
      "border border-border/60 bg-default px-1.5 py-1.5",
    ].join(" "),
    range: [
      "min-w-0 flex-1 text-center text-sm font-semibold tabular-nums tracking-tight",
      "text-foreground",
    ].join(" "),
    days: [
      "grid grid-cols-7 gap-1.5",
    ].join(" "),
    dayButton: [
      "relative flex aspect-[0.85] w-full flex-col items-center justify-center gap-1",
      "rounded-[1.25rem] border border-transparent",
      "bg-surface-secondary/70 text-foreground",
      "transition-[background-color,border-color,color,transform,box-shadow] duration-200",
      "active:scale-[0.97]",
    ].join(" "),
    dayButtonSelected: [
      "border-accent/30 bg-accent text-accent-foreground shadow-[0_8px_20px_color-mix(in_oklch,var(--accent)_35%,transparent)]",
    ].join(" "),
    dayButtonHasItems: "ring-1 ring-accent/25",
    dayButtonToday: "border-border/80",
    dayName: "text-[0.65rem] font-medium leading-none text-muted",
    dayNameSelected: "text-accent-foreground/85",
    dayNumber: "text-[1.05rem] font-bold leading-none tabular-nums",
    dayNumberSelected: "text-accent-foreground",
    dayDot:
      "absolute bottom-1.5 size-1 rounded-full bg-accent",
    dayDotSelected: "bg-accent-foreground",
    list: "flex flex-col gap-3",
    empty: [
      "rounded-[1.5rem] border border-dashed border-border/70",
      "bg-surface-secondary/40 px-4 py-7 text-center text-sm text-muted",
    ].join(" "),
    status: [
      "rounded-[1.5rem] border border-border/60 bg-default/50",
      "px-4 py-5 text-center text-sm text-muted",
    ].join(" "),
    statusError: "border-danger/40 text-danger",
    item: "flex flex-col gap-1.5",
    timeRow: "flex items-center justify-between gap-2 px-0.5",
    time: "text-xs font-medium tabular-nums text-muted",
    cancelledBadge: [
      "inline-flex items-center rounded-lg px-2 py-0.5",
      "bg-danger/15 text-[0.65rem] font-semibold text-danger",
    ].join(" "),
    cancelled: "opacity-60",
  },
});

export const discoveryClubsDetailCalendarSectionStyles =
  discoveryClubsDetailCalendarSectionVariants();
