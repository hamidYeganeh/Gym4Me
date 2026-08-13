import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const discoveryCoachesDetailReviewsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    filtersBlock: "flex flex-col gap-3",
    filtersTitle: "text-foreground",
    filters: "flex flex-wrap gap-2.5",
    search: "w-full",
    list: "flex flex-col gap-3",
    reviewCard: "border-0 bg-surface shadow-sm shadow-foreground/5",
  },
});

export type DiscoveryCoachesDetailReviewsSectionVariants = VariantProps<
  typeof discoveryCoachesDetailReviewsSectionVariants
>;
