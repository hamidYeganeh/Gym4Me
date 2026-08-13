import { tv } from "tailwind-variants";

export const analyticsBookingStatusSectionVariants = tv({
  slots: {
    card: "rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader: "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    content: "p-5 sm:p-6",
    row: "flex items-center justify-between gap-3",
    rowStart: "flex min-w-0 items-center gap-2",
    rowCount:
      "shrink-0 text-sm font-black text-foreground [font-variant-numeric:tabular-nums]",
  },
});
