import { tv } from "tailwind-variants";

export const athleteWeightMetricsHistorySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-1",
    header: "flex items-center justify-between gap-3",
    title: "text-foreground",
    seeAll: "cursor-pointer text-sm font-medium text-stats-orange no-underline",
    list: "flex flex-col gap-2.5",
  },
});
