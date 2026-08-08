import { tv } from "tailwind-variants";

export const analyticsRetentionSectionVariants = tv({
  slots: {
    card: "h-full rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader: "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    content: "flex flex-col gap-4 p-5 sm:p-6",
    grid: "grid grid-cols-[auto_repeat(6,minmax(0,1fr))] gap-1.5",
    cohortLabel:
      "flex items-center pe-2 text-xs font-semibold text-muted [font-variant-numeric:tabular-nums]",
    headerCell:
      "pb-1 text-center text-[11px] font-semibold text-muted [font-variant-numeric:tabular-nums]",
    cell: "flex h-8 items-center justify-center rounded-md text-[11px] font-bold text-foreground [font-variant-numeric:tabular-nums]",
    emptyCell: "h-8 rounded-md bg-surface-secondary/50",
    legend: "flex items-center gap-2 text-xs font-medium text-muted",
    legendSwatches: "flex items-center gap-1",
    legendSwatch: "size-3.5 rounded-sm",
  },
});
