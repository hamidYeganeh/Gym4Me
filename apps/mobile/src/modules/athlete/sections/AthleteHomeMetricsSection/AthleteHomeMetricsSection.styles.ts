import { tv } from "tailwind-variants";

export const athleteHomeMetricsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    grid: "flex flex-col gap-3",
    empty: "rounded-[24px] bg-surface px-4 py-6 [&_h2]:text-lg",
  },
});
