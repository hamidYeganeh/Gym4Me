import { tv } from "tailwind-variants";

export const dashboardHomePrimaryGridSectionVariants = tv({
  slots: {
    primaryGrid:
      "grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.7fr)]",
    revenueCard:
      "min-h-[25rem] rounded-[1.5rem] border border-border bg-surface shadow-none",
    queueCard: "rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader:
      "flex flex-col gap-4 border-b border-separator p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "mt-1 text-sm leading-6 text-muted",
    cardFooter: "border-t border-separator p-4",
    revenueTotal: "flex shrink-0 flex-col items-start sm:items-end",
    revenueValue:
      "text-xl font-black text-foreground [font-variant-numeric:tabular-nums]",
    revenueUnit: "mt-1 text-xs font-medium text-muted",
    chartContent: "flex flex-1 px-5 pb-5 pt-7 sm:px-6 sm:pb-6",
    chart: "min-h-60 w-full",
    chartFallback: "flex min-h-60 w-full items-center justify-center",
    queueTotal:
      "flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/12 text-sm font-black text-warning [font-variant-numeric:tabular-nums]",
    queueContent: "flex flex-col p-0",
    queueItem:
      "flex items-center gap-3 border-b border-separator px-5 py-4 last:border-b-0",
    queueIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted",
    queueCopy: "flex min-w-0 flex-1 flex-col gap-1",
    queueTitle: "text-sm font-bold text-foreground",
    queueDescription: "truncate text-xs text-muted",
    queueCount:
      "text-sm font-black text-foreground [font-variant-numeric:tabular-nums]",
  },
  variants: {
    tone: {
      warning: { queueIcon: "bg-warning/12 text-warning" },
      danger: { queueIcon: "bg-danger/12 text-danger" },
      neutral: { queueIcon: "bg-surface-secondary text-muted" },
    },
  },
  defaultVariants: { tone: "neutral" },
});
