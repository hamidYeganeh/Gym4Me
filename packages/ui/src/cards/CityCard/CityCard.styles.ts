import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const cityCardVariants = tv({
  slots: {
    root: [
      "relative flex flex-col overflow-hidden",
      "bg-surface-tertiary text-stats-foreground",
    ].join(" "),
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-b from-background to-transparent",
    ].join(" "),
    body: "relative z-10 flex h-full min-h-0 flex-col",
    city: "leading-tight tracking-tight text-stats-foreground",
    footer: "mt-auto flex flex-col",
    discount: [
      "max-w-full self-end border-0",
      "[--chip-bg:var(--warning)]",
      "[--chip-fg:var(--stats-foreground)]",
      "[&_.chip__label]:font-semibold",
    ].join(" "),
    title: "leading-tight tracking-tight text-stats-foreground",
    action: [
      "w-full rounded-full",
      "font-medium leading-tight whitespace-normal",
    ].join(" "),
  },
  variants: {
    size: {
      sm: {
        root: "h-[180px] w-[132px] rounded-[20px] p-2.5",
        city: "text-base",
        footer: "gap-1.5",
        discount:
          "h-5 px-1.5 [&_.chip__label]:text-[10px]",
        title: "text-xs",
        action: "min-h-7 px-2 text-[9px]",
      },
      md: {
        root: "h-[220px] w-[160px] rounded-[24px] p-3",
        city: "text-xl",
        footer: "gap-2",
        discount:
          "h-6 px-2 [&_.chip__label]:text-[11px]",
        title: "text-sm",
        action: "min-h-8 px-2.5 text-[10px]",
      },
      lg: {
        root: "h-[280px] w-[200px] rounded-[28px] p-4",
        city: "text-2xl",
        footer: "gap-2.5",
        discount:
          "h-7 px-2.5 [&_.chip__label]:text-xs",
        title: "text-base",
        action: "min-h-9 px-3 text-xs",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type CityCardVariantProps = VariantProps<typeof cityCardVariants>;
