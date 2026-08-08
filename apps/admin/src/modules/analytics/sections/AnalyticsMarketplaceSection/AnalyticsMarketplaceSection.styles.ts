import { tv } from "tailwind-variants";

export const analyticsMarketplaceSectionVariants = tv({
  slots: {
    card: "rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader: "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    content: "grid gap-8 p-5 sm:p-6 lg:grid-cols-2",
    list: "flex flex-col gap-4",
    listTitle: "text-sm font-bold text-foreground",
    row: "flex items-center gap-3",
    rank: "flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-xs font-black text-muted [font-variant-numeric:tabular-nums]",
    rowBody: "flex min-w-0 flex-1 flex-col gap-1.5",
    rowTop: "flex items-center justify-between gap-3",
    rowName: "truncate text-sm font-semibold text-foreground",
    rowCount:
      "shrink-0 text-xs font-bold text-muted [font-variant-numeric:tabular-nums]",
    track: "h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary",
    fill: "block h-full rounded-full bg-accent",
  },
});
