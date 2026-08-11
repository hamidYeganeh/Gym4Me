import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const reviewSummaryCardVariants = tv({
  slots: {
    root: [
      "w-full gap-0 overflow-hidden rounded-[1.75rem] p-5",
      "border border-border/60 bg-default text-default-foreground shadow-none",
    ].join(" "),
    summary: "flex items-start justify-between gap-4",
    averageBlock: "flex min-w-0 shrink-0 flex-col gap-1",
    average: "text-[2.75rem] font-bold leading-none tracking-tight text-foreground",
    averageLabel: "text-sm font-medium leading-tight text-foreground",
    usersLabel: "text-sm font-normal leading-tight text-muted",
    bars: "flex min-w-0 flex-1 flex-col gap-1.5 pt-1",
    barRow: "flex items-center gap-2",
    barStar: [
      "inline-flex w-7 shrink-0 items-center justify-end gap-0.5",
      "text-xs font-medium tabular-nums text-foreground",
    ].join(" "),
    barStarIcon: "size-3 shrink-0 text-accent",
    progress: "min-w-0 flex-1",
    progressTrack: "h-2 overflow-hidden rounded-full bg-surface-secondary",
    progressFill: "rounded-full bg-foreground",
    barCount: "w-8 shrink-0 text-end text-xs tabular-nums text-muted",
    highlights: "mt-4 flex w-full flex-col",
    divider: [
      "mx-0 shrink-0 bg-separator",
      "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
    ].join(" "),
    highlight: "flex h-[68px] w-full min-w-0 items-center gap-3",
    highlightIcon: "size-6 shrink-0 text-accent",
    highlightMeta: "flex min-w-0 flex-1 flex-col gap-0.5",
    highlightTitle: "text-base font-bold leading-tight tracking-tight text-foreground",
    highlightDescription: "text-sm font-normal leading-snug text-muted",
  },
});

export type ReviewSummaryCardVariantProps = VariantProps<
  typeof reviewSummaryCardVariants
>;
