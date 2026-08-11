import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachConsultationTypeVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3 text-foreground",
    title: "min-w-0 text-sm font-medium text-muted",
    card: [
      "w-full gap-0 overflow-hidden rounded-[1.75rem] p-0",
      "border border-border/60 bg-default text-default-foreground shadow-none",
    ].join(" "),
    content: "flex w-full flex-col gap-0 p-0",
    divider: [
      "shrink-0 bg-separator",
      "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
    ].join(" "),
    row: [
      "flex h-[68px] w-full min-w-0 items-center gap-3 px-4 text-start",
      "rounded-none bg-transparent shadow-none outline-none",
      "transition-colors duration-fast ease-app",
    ].join(" "),
    iconWrap: [
      "flex size-11 shrink-0 items-center justify-center rounded-full",
      "border border-border/80 bg-surface text-foreground",
    ].join(" "),
    meta: "flex min-w-0 flex-1 flex-col gap-0.5",
    optionTitle: "text-base font-semibold leading-tight tracking-tight text-foreground",
    statusLabel: "text-sm font-normal leading-tight text-muted",
    priceGroup:
      "flex shrink-0 flex-wrap items-baseline justify-end gap-1 text-foreground",
    pricePrefix: "text-xs font-normal text-muted",
    price: "text-base font-semibold tabular-nums leading-none text-foreground",
    priceSuffix: "text-xs font-normal text-muted",
  },
  variants: {
    status: {
      available: {
        row: [
          "cursor-pointer text-foreground",
          "hover:bg-surface-secondary/60 data-[hovered=true]:bg-surface-secondary/60",
          "data-[pressed=true]:bg-surface-secondary/80",
        ].join(" "),
      },
      unavailable: {
        row: "cursor-default data-[hovered=true]:bg-transparent",
      },
    },
    selected: {
      true: {
        row: "bg-surface-secondary/70",
      },
      false: {},
    },
    interactive: {
      true: {},
      false: {
        row: "cursor-default hover:bg-transparent data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent",
      },
    },
  },
  defaultVariants: {
    status: "available",
    selected: false,
    interactive: false,
  },
});

export type CoachConsultationTypeVariantProps = VariantProps<
  typeof coachConsultationTypeVariants
>;
