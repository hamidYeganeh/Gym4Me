import { tv } from "tailwind-variants";

export const welcomeMetricCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-3 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-3.5",
      "text-surface-foreground",
      "shadow-[0_14px_32px_-16px_color-mix(in_oklab,var(--foreground)_16%,transparent)]",
    ],
    header: "flex w-full flex-row items-center justify-between gap-2 p-0",
    titleRow: "flex min-w-0 items-center gap-2",
    titleIcon: "size-5 shrink-0",
    title: "truncate text-[0.95rem] font-semibold text-foreground",
    periodRow: "inline-flex shrink-0 items-center gap-1 text-xs text-muted",
    periodIcon: "size-3.5",
    body: "flex w-full flex-row items-end justify-between gap-3",
    metrics: "flex min-w-0 flex-1 flex-col gap-1",
    valueRow: "flex flex-wrap items-baseline gap-1.5",
    value: "text-[1.65rem] leading-none font-bold tracking-tight text-foreground",
    unit: "text-sm font-medium text-muted",
    status: "text-[0.7rem] leading-snug text-muted",
    chartWrap: "w-[42%] shrink-0",
    chart: "h-[3.5rem] w-full overflow-visible",
    weekdayRow: "mt-1 flex justify-between px-0.5 text-[0.55rem] text-muted",
  },
  variants: {
    tone: {
      weight: {
        titleIcon: "text-accent",
      },
      pressure: {
        titleIcon: "text-stats-purple",
        root: "border-[color-mix(in_oklch,var(--stats-purple)_45%,var(--border))] shadow-[0_0_28px_-8px_color-mix(in_oklch,var(--stats-purple)_40%,transparent)]",
      },
      heart: {
        titleIcon: "text-stats-red",
      },
    },
  },
  defaultVariants: {
    tone: "weight",
  },
});
