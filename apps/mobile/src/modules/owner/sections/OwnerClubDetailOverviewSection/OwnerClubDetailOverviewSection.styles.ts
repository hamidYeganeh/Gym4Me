import { tv } from "tailwind-variants";

export const ownerClubDetailOverviewSectionVariants = tv({
  slots: {
    statsGrid: "grid grid-cols-2 gap-4",
    chartCard: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    chartTitle: "text-foreground",
    chart: "w-full",
    section: "flex flex-col gap-4",
    sectionTitle: "text-foreground",
    groupCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex w-full items-center gap-3 px-4 py-3.5",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowValue: "shrink-0 text-sm font-semibold text-foreground",
    divider: "mx-4 h-px bg-border",
  },
});
