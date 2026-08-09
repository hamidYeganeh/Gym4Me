import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const reservationDayChipVariants = tv({
  slots: {
    root: [
      "flex h-auto min-w-[6.5rem] shrink-0 snap-start flex-col items-start gap-0.5",
      "rounded-[22px] border px-4 py-3.5 text-start shadow-none",
      "data-[pressed=true]:scale-[0.98]",
      "transition-[border-color,background-color,opacity,transform,box-shadow] duration-fast ease-app",
    ].join(" "),
    date: "text-sm leading-snug",
    status: "text-base font-bold leading-tight tracking-tight",
  },
  variants: {
    availability: {
      available: {
        root: [
          "border-accent/35 bg-surface",
          "[--button-bg:var(--surface)]",
          "[--button-bg-hover:color-mix(in_oklab,var(--accent)_8%,var(--surface))]",
          "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
        ].join(" "),
        date: "text-muted",
        status: "text-accent/75",
      },
      unavailable: {
        root: [
          "border-border bg-surface-secondary opacity-80",
          "[--button-bg:var(--surface-secondary)]",
          "[--button-bg-hover:var(--surface-secondary)]",
          "[--button-bg-pressed:var(--surface-secondary)]",
        ].join(" "),
        date: "text-muted",
        status: "text-muted",
      },
    },
    selected: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      availability: "available",
      selected: true,
      class: {
        root: [
          "border-accent",
          "bg-[color-mix(in_oklab,var(--accent)_14%,var(--surface))]",
          "ring-2 ring-accent/25",
          "[--button-bg:color-mix(in_oklab,var(--accent)_14%,var(--surface))]",
          "[--button-bg-hover:color-mix(in_oklab,var(--accent)_18%,var(--surface))]",
          "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_20%,var(--surface))]",
        ].join(" "),
        date: "text-foreground",
        status: "text-accent",
      },
    },
    {
      availability: "unavailable",
      selected: true,
      class: {
        root: "border-muted ring-2 ring-muted/20",
      },
    },
  ],
  defaultVariants: {
    availability: "available",
    selected: false,
  },
});

export type ReservationDayChipVariantProps = VariantProps<
  typeof reservationDayChipVariants
>;
