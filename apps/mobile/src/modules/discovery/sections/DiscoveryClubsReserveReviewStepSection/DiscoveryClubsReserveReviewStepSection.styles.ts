import { tv } from "tailwind-variants";

export const discoveryClubsReserveReviewStepSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    summaryCard: [
      "flex flex-col gap-0 overflow-hidden rounded-2xl border border-border/60",
      "bg-surface",
    ].join(" "),
    summaryRow: [
      "flex items-center justify-between gap-3 px-4 py-3.5",
      "border-b border-border/50 last:border-b-0",
    ].join(" "),
    summaryLabel: "text-muted",
    summaryValue: "text-end text-foreground",
    summaryTotalRow: "bg-default/40",
    summaryTotalValue: "text-end text-foreground",
  },
});
