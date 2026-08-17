import { tv } from "tailwind-variants";

export const athleteWeightMetricsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-2",
    summary: "flex flex-col gap-2",
    summaryRow: "flex items-center gap-3",
    summaryIcon:
      "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success text-success-foreground",
    summaryValueRow: "flex items-baseline gap-1.5",
    summaryValue:
      "text-[34px] leading-none tracking-tight text-foreground",
    summaryUnit: "text-lg text-muted",
    summaryCaption: "text-muted",
  },
});
