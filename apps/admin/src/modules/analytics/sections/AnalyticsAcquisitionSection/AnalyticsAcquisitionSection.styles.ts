import { tv } from "tailwind-variants";

export const analyticsAcquisitionSectionVariants = tv({
  slots: {
    card: "h-full rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader: "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    content: "p-5 sm:p-6",
    row: "flex flex-col gap-2",
    rowTop: "flex items-center justify-between gap-4",
    rowLabel: "text-sm font-bold text-foreground",
    rowNumbers:
      "flex items-baseline gap-2 [font-variant-numeric:tabular-nums]",
    rowCount: "text-sm font-black text-foreground",
    rowShare: "text-xs font-semibold text-muted",
    track:
      "h-2 w-full overflow-hidden rounded-full bg-surface-secondary",
    fill: "block h-full rounded-full bg-accent",
  },
});
