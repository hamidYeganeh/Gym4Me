import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricGoalCardVariants = tv({
  slots: {
    root: [
      "flex flex-col gap-4 rounded-[1.25rem] border-0 bg-surface",
      "px-4 py-5 text-start",
    ].join(" "),
    header: "flex items-center gap-3",
    iconWrap:
      "flex size-11 shrink-0 items-center justify-center rounded-[0.875rem] bg-stats-orange/15 text-stats-orange",
    goalMeta: "flex min-w-0 flex-col gap-0.5",
    goalValue: "text-[22px] leading-none tracking-tight text-foreground",
    goalLabel: "text-sm text-muted",
    description: "text-sm leading-relaxed text-muted",
    progress: "flex w-full flex-col gap-2",
    track: "h-2.5 w-full overflow-hidden rounded-full bg-default",
    fill: "h-full rounded-full bg-stats-orange",
    progressLabels: "flex items-center justify-between gap-3",
    progressText: "text-sm font-medium tabular-nums text-foreground",
    edit: "mx-auto gap-1.5 text-stats-orange",
    editIcon: "size-4 shrink-0",
  },
});

export type MetricGoalCardVariantProps = VariantProps<
  typeof metricGoalCardVariants
>;
