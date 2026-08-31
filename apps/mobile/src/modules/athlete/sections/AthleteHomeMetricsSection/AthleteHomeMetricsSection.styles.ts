import { tv } from "tailwind-variants";

export const athleteHomeMetricsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    grid: "flex flex-col gap-3",
    empty: "bg-surface [&_h2]:text-lg",
  },
});
