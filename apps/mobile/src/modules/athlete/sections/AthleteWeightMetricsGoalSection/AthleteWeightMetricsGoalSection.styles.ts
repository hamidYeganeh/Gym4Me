import { tv } from "tailwind-variants";

export const athleteWeightMetricsGoalSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    header: "flex items-center justify-between gap-3",
    title: "text-foreground",
    seeAll: "cursor-pointer text-sm font-medium text-stats-orange no-underline",
  },
});
