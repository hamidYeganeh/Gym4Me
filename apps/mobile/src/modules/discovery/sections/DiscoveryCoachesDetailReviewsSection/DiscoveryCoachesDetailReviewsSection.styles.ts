import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const discoveryCoachesDetailReviewsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    sectionHeader: "flex items-center justify-between gap-3",
    sectionTitle: "text-foreground",
    seeAll: "text-sm font-semibold text-accent",
    summaryCard:
      "flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-surface p-4",
    summaryTop: "flex items-end justify-between gap-4",
    average: "tracking-tight text-foreground",
    averageMeta: "text-muted",
    bars: "flex flex-col gap-2",
    barRow: "flex items-center gap-2",
    barStar: "inline-flex w-8 items-center gap-1 text-accent",
    barTrack: "h-1.5 flex-1 overflow-hidden rounded-full bg-default",
    barFill: "h-full rounded-full bg-foreground/80",
    barCount: "w-8 text-end text-xs tabular-nums text-muted",
    filtersBlock: "flex flex-col gap-3",
    filtersTitle: "text-foreground",
    filters: "flex flex-wrap gap-2.5",
    search: "w-full",
    list: "flex flex-col gap-3",
    reviewCard: "border border-border/70 bg-surface",
  },
});

export type DiscoveryCoachesDetailReviewsSectionVariants = VariantProps<
  typeof discoveryCoachesDetailReviewsSectionVariants
>;
