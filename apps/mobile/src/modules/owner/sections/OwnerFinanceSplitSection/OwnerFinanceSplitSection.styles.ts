import { tv } from "tailwind-variants";

export const ownerFinanceSplitSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    sectionHint: "text-muted",
    groupCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex w-full items-center gap-3 px-4 py-3.5",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowValue: "shrink-0 text-sm text-foreground",
    rowValueBold: "shrink-0 text-sm font-bold text-foreground",
    totalRowLabel: "font-bold text-foreground",
    totalDivider: "mx-4 h-px bg-border",
  },
});
