import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricCardVariants = tv({
  slots: {
    root: [
      // Override HeroUI `.card` (flex-col gap-3 p-4)
      "relative !flex !flex-col !gap-0 !p-5 w-full",
      "w-full overflow-hidden rounded-[28px] border-0 bg-surface",
      "text-start text-surface-foreground shadow-none outline-none",
      "data-[pressable=true]:cursor-pointer",
      "data-[pressable=true]:transition-transform data-[pressable=true]:active:scale-[0.99]",
    ].join(" "),
    // Override `.card__header` (flex-col)
    header: "!flex !flex-row !items-center !justify-between gap-3 p-0 mb-4",
    titleGroup: "flex min-w-0 flex-row items-center gap-2.5",
    icon: [
      "flex size-8 shrink-0 items-center justify-center rounded-[10px]",
      "bg-[var(--metric-accent,var(--stats-orange))] text-stats-foreground",
      "[&_svg]:block [&_svg]:text-current",
    ].join(" "),
    title: [
      // Override `.card__title`
      "!text-[15px] !font-semibold !leading-none truncate text-foreground",
    ].join(" "),
    period: [
      "inline-flex h-auto min-h-0 shrink-0 items-center gap-0.5 rounded-md !px-0 !py-0",
      "text-sm font-medium text-muted shadow-none",
      "hover:bg-transparent hover:text-foreground",
      "pressed:bg-transparent data-[pressed=true]:bg-transparent",
    ].join(" "),
    periodIcon: "size-3.5 shrink-0 text-current",
    // Override `.card__content` (flex-col)
    body: "!flex !flex-row !items-end !justify-between !gap-4 !p-0",
    meta: "flex min-w-0 flex-1 flex-col items-start gap-1 text-start",
    valueRow: "flex flex-row items-baseline gap-1 leading-none",
    value: "text-[32px] font-bold leading-none tracking-tight text-foreground",
    unit: "text-base font-semibold leading-none text-foreground",
    status: "!text-sm !leading-none text-muted",
    chart: "flex w-[152px] shrink-0 flex-col items-stretch gap-1.5",
    chartPlot: "flex h-[58px] w-full flex-row items-end justify-between",
    days: "grid w-full grid-cols-7 gap-0",
    day: "text-center text-[10px] font-medium leading-none text-muted",
    barTrack: [
      "relative h-full w-[12px] shrink-0 overflow-hidden rounded-full",
      "bg-surface-secondary",
    ].join(" "),
    barFill: [
      "absolute inset-x-0 bottom-0 rounded-full",
      "bg-[var(--metric-accent,var(--stats-orange))]",
    ].join(" "),
    rangeFill: [
      "absolute inset-x-0 rounded-full",
      "bg-[var(--metric-accent,var(--stats-purple))]",
    ].join(" "),
    linePlot: "h-[58px] w-full",
    lineSvg: "block h-full w-full",
    rings: "flex h-[58px] w-full flex-row items-end justify-between",
    ringCol: "flex flex-col items-center gap-0.5",
    ringStatus: "flex h-3 items-center justify-center",
    ringStatusIcon: "size-2.5",
    ringSvg: "size-7",
    dots: "flex h-[58px] w-full flex-row items-center justify-between px-0.5",
    dotCol: "flex flex-col-reverse items-center gap-1",
    dot: "size-2 rounded-full bg-surface-secondary",
    dotFilled: "bg-[var(--metric-accent,var(--success))]",
    moods: "flex h-[58px] w-full flex-row items-center justify-between",
    moodIcon: "size-5 text-foreground",
    moodEmpty: "size-5 rounded-full bg-surface-secondary",
  },
});

export type MetricCardVariantProps = VariantProps<typeof metricCardVariants>;
