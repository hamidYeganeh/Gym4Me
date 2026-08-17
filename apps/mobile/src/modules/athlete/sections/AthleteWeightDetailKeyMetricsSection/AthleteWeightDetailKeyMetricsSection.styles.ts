import { tv } from "tailwind-variants";

export const athleteWeightDetailKeyMetricsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-1",
    header: "flex items-center justify-between gap-3",
    title: "text-foreground",
    seeAll: "cursor-pointer text-sm font-medium text-stats-orange no-underline",
    row: "flex items-center gap-3 py-3.5",
    rowIcon:
      "flex size-9 shrink-0 items-center justify-center text-muted [&_svg]:block",
    rowLabel: "min-w-0 flex-1 text-foreground",
    rowValue: "flex shrink-0 items-center gap-1 text-foreground",
    separator: "bg-separator",
  },
});
