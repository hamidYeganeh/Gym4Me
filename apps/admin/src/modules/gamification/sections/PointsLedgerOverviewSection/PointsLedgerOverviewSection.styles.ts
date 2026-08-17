import { tv } from "tailwind-variants";

export const pointsLedgerOverviewSectionVariants = tv({
  slots: {
    statsGrid: "grid grid-cols-2 gap-3 lg:grid-cols-4",
    statValue: "text-2xl font-bold tabular-nums",
    statLabel: "text-xs text-muted",
    breakdownGrid: "grid grid-cols-1 gap-3 lg:grid-cols-2",
    breakdownList: "flex flex-col gap-2",
    breakdownRow:
      "flex items-center justify-between gap-2 rounded-xl bg-content2 px-3 py-2 text-sm",
  },
});
