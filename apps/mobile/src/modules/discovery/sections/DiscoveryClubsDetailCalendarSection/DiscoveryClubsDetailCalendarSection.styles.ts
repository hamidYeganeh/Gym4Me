import { tv } from "tailwind-variants";

export const discoveryClubsDetailCalendarSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex items-center justify-between gap-3",
    titleRow: "flex min-w-0 flex-1 items-center gap-2",
    titleIcon: "shrink-0 text-accent",
    title: "min-w-0 flex-1 text-foreground",
    seeAll: "shrink-0 text-sm font-semibold text-accent",
    nav: [
      "flex items-center justify-between gap-2 rounded-[1.5rem]",
      "border border-border/60 bg-default px-1.5 py-1.5",
    ].join(" "),
    rangeCluster: "flex min-w-0 flex-1 items-center justify-center gap-1",
    range: [
      "min-w-0 text-center text-sm font-semibold tabular-nums tracking-tight",
      "text-foreground",
    ].join(" "),
    pickerButton: [
      "shrink-0 text-muted",
      "hover:text-foreground data-[hovered=true]:text-foreground",
    ].join(" "),
    pickerDrawerBody: "overflow-hidden px-1",
    pickerDrawerScroll: "max-h-[min(75dvh,40rem)]",
    pickerMonths: "flex w-full flex-col gap-6 pb-2 pt-1",
    pickerMonth: "w-full",
    pickerMonthHeader: "mb-2 justify-center px-1",
    pickerHeading:
      "flex-none text-center text-base font-semibold text-foreground",
    pickerCalendar: "w-full max-w-none",
    days: [
      "flex gap-2 overflow-x-auto pb-1",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    dayButton: [
      "relative flex h-[89px] w-16 shrink-0 flex-col items-center justify-center",
      "gap-2.5 rounded-[20px] p-4",
      "transition-[background-color,box-shadow,color,transform] duration-200",
      "active:scale-[0.97]",
      "bg-surface text-foreground",
      "",
    ].join(" "),
    dayButtonSelected: [
      "bg-accent! text-accent-foreground!",
      "shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_25%,transparent)]!",
    ].join(" "),
    dayButtonClosed: [
      "bg-surface-secondary! text-muted!",
      "shadow-none!",
      "pointer-events-none",
    ].join(" "),
    dayName: "text-[0.7rem] font-medium leading-none text-muted",
    dayNameSelected: "text-accent-foreground/80!",
    dayNameClosed: "text-muted/70!",
    dayNumber:
      "text-[1.15rem] font-bold leading-none tabular-nums text-foreground",
    dayNumberSelected: "text-accent-foreground!",
    dayNumberClosed: "text-muted/60!",
    dayDot: "size-1.5 shrink-0 rounded-[3px] bg-muted/40",
    dayDotSelected: "bg-accent-foreground!",
    dayDotClosed: "bg-muted/30!",
    empty: [
      "rounded-[1.5rem] border border-dashed border-border/70",
      "bg-surface-secondary/40 px-4 py-7 text-center text-sm text-muted",
    ].join(" "),
    status: [
      "rounded-[1.5rem] border border-border/60 bg-default/50",
      "px-4 py-5 text-center text-sm text-muted",
    ].join(" "),
    statusError: "border-danger/40 text-danger",
    timeline: "relative flex flex-col",
    timelineLine: [
      "pointer-events-none absolute top-3 bottom-3 z-0 w-px bg-foreground/20",
      // Center of the 4.25rem rail column (start side in LTR/RTL).
      "start-[calc(4.25rem/2)] -translate-x-1/2",
      "rtl:translate-x-1/2",
    ].join(" "),
    hourGroup: [
      "relative z-10 grid grid-cols-[4.25rem_minmax(0,1fr)] items-stretch gap-3",
    ].join(" "),
    rail: "relative flex h-auto min-h-full justify-center self-stretch",
    timeBadge: [
      "sticky top-22 z-20 inline-flex h-6 min-w-[3.5rem] shrink-0 items-center justify-center self-start",
      "rounded-full bg-surface-secondary px-2.5 mb-8",
      "text-[0.7rem] font-semibold leading-none tabular-nums tracking-tight",
      "text-muted shadow-sm ring-4 ring-background",
    ].join(" "),
    cards: "flex min-w-0 flex-col gap-3 pb-5",
    cardsLast: "pb-0",
    cardWrap: "min-w-0",
    cancelled: "opacity-60",
    cancelledBadge: [
      "mb-1.5 inline-flex items-center self-start rounded-lg px-2 py-0.5",
      "bg-danger/15 text-[0.65rem] font-semibold text-danger",
    ].join(" "),
    skeletonRoot: "relative flex flex-col gap-0",
    skeletonGroup: [
      "relative z-10 grid grid-cols-[4.25rem_minmax(0,1fr)] items-stretch gap-3",
    ].join(" "),
    skeletonRail: "relative flex justify-center self-stretch pt-1",
    skeletonBadge: "h-6 w-14 shrink-0 rounded-full",
    skeletonCards: "flex min-w-0 flex-col gap-3 pb-5",
    skeletonCard: [
      "flex h-[5.25rem] w-full items-center gap-3 rounded-[22px]",
      "border-0 bg-surface px-3 py-3",
    ].join(" "),
    skeletonThumb: "size-14 shrink-0 rounded-2xl",
    skeletonLines: "flex min-w-0 flex-1 flex-col gap-2",
    skeletonLine: "h-3 rounded-md",
  },
});

export const discoveryClubsDetailCalendarSectionStyles =
  discoveryClubsDetailCalendarSectionVariants();
