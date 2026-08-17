import { tv } from "tailwind-variants";

export const athleteWeightMetricsChartSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    periodGroup:
      "w-full gap-1.5 bg-transparent p-0 shadow-none",
    periodToggle: [
      "min-w-0 flex-1 rounded-full border-0 bg-default px-2 py-2",
      "text-xs font-medium text-foreground shadow-none",
      "data-[selected=true]:bg-foreground data-[selected=true]:text-background",
    ].join(" "),
  },
});
