import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachAvailabilitySlotsVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3 text-foreground",
    header: "flex items-center justify-between gap-3",
    title: "min-w-0 text-sm font-medium text-muted",
    seeAll: [
      "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
    ].join(" "),
    card: [
      "w-full gap-5 overflow-hidden rounded-[1.75rem] p-4",
      "border border-border/60 bg-default text-default-foreground shadow-none",
    ].join(" "),
    content: "flex w-full flex-col gap-5 p-0",
    day: "flex min-w-0 flex-col gap-2.5",
    dayLabel: "text-base font-bold leading-none tracking-tight text-foreground",
    slotsRow: [
      "flex min-w-0 flex-row gap-2.5 overflow-x-auto pb-0.5",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    slot: [
      "inline-flex h-14 min-w-[5.25rem] shrink-0 flex-col items-start justify-center gap-1",
      "rounded-[14px] border p-2",
      "text-start shadow-none transition-[color,background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    slotTime: "text-[0.7rem] font-medium tabular-nums leading-none",
    slotStatus: "text-sm font-bold leading-none tracking-tight",
  },
  variants: {
    status: {
      available: {
        slot: [
          "cursor-pointer border-border/70 bg-surface text-foreground",
          "hover:bg-surface-secondary data-[hovered=true]:bg-surface-secondary",
        ].join(" "),
        slotTime: "text-muted",
        slotStatus: "text-foreground",
      },
      unavailable: {
        slot: [
          "cursor-default border-danger bg-danger/10 text-danger",
          "data-[hovered=true]:bg-danger/10 data-[disabled=true]:opacity-100",
        ].join(" "),
        slotTime: "text-danger",
        slotStatus: "text-danger",
      },
    },
    selected: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      status: "available",
      selected: true,
      class: {
        slot: [
          "border-accent bg-accent/15 text-accent",
          "hover:bg-accent/20 data-[hovered=true]:bg-accent/20",
        ].join(" "),
        slotTime: "text-accent",
        slotStatus: "text-accent",
      },
    },
  ],
  defaultVariants: {
    status: "available",
    selected: false,
  },
});

export type CoachAvailabilitySlotsVariantProps = VariantProps<
  typeof coachAvailabilitySlotsVariants
>;
