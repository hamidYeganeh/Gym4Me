import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricInsightCardVariants = tv({
  slots: {
    root: [
      "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface",
      "px-4 py-4 text-start shadow-sm shadow-foreground/5",
    ].join(" "),
    row: "flex items-start justify-between gap-4",
    meta: "flex min-w-0 flex-1 flex-col gap-1",
    label: "text-muted",
    value: "text-[28px] leading-none tracking-tight text-foreground",
    change: "mt-1 flex items-center gap-1 text-sm text-stats-red",
    changeIcon: "size-3.5 shrink-0",
    chart: "h-12 w-[88px] shrink-0 self-center text-stats-red",
    tip: "text-sm leading-relaxed text-muted",
  },
});

export type MetricInsightCardVariantProps = VariantProps<
  typeof metricInsightCardVariants
>;
