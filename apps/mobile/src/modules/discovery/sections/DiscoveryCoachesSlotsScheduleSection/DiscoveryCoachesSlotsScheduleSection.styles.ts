import { tv } from "tailwind-variants";

export const discoveryCoachesSlotsScheduleSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    weekRow: "flex items-center justify-between gap-3",
    weekLabel:
      "min-w-0 flex-1 text-[1.65rem] font-bold tracking-tight text-foreground",
    weekNav: "flex shrink-0 items-center gap-2",
    weekButton: [
      "shrink-0 border-0",
      "bg-foreground text-background shadow-none",
      "data-[hovered=true]:opacity-90 data-[pressed=true]:scale-95",
    ].join(" "),
    weekButtonIcon: "size-[1.125rem] shrink-0 text-background",
    days: "flex flex-col gap-5",
    day: "flex flex-col gap-2.5",
    dayLabel: "text-sm font-bold leading-none tracking-tight text-foreground",
    slotsScroll: "min-w-0 w-full",
    slotsRow: "flex w-max flex-row gap-2.5 pe-1",
    slot: [
      "inline-flex w-auto min-w-[5.5rem] shrink-0 items-center justify-center border",
      "text-sm font-semibold tabular-nums leading-none shadow-none",
      "transition-[color,background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    slotAvailable: [
      "cursor-pointer border-border/70 bg-surface text-foreground",
      "hover:bg-surface-secondary data-[hovered=true]:bg-surface-secondary",
    ].join(" "),
    slotUnavailable: [
      "cursor-default border-danger bg-danger/10 text-danger",
      "data-[hovered=true]:bg-danger/10 data-[disabled=true]:opacity-100",
    ].join(" "),
    slotSelected: [
      "border-accent bg-accent/15 text-accent",
      "hover:bg-accent/20 data-[hovered=true]:bg-accent/20",
    ].join(" "),
  },
});
