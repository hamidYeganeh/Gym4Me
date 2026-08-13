import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const donutChartVariants = tv({
  slots: {
    root: "flex h-full min-h-56 w-full flex-col gap-4 sm:flex-row sm:items-center",
    chart: "h-56 w-full min-w-0 sm:h-64",
    legend: "flex flex-col gap-2",
    legendItem: "flex items-center justify-between gap-3 text-sm",
    swatch: "size-2.5 shrink-0 rounded-full",
    legendLabel: "flex min-w-0 items-center gap-2 text-foreground",
    legendValue: "shrink-0 font-bold tabular-nums text-foreground",
  },
});

export type DonutChartVariantProps = VariantProps<typeof donutChartVariants>;
