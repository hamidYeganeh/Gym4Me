import { tv } from "tailwind-variants";

export const dashboardHomeStatsSectionVariants = tv({
  slots: {
    activityCard:
      "rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader:
      "flex flex-col gap-4 border-b border-separator p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "mt-1 text-sm leading-6 text-muted",
    metricsContent:
      "grid p-0 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-x-reverse xl:divide-separator",
    metric:
      "flex min-h-40 flex-col justify-between border-b border-separator p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-e sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:border-e-0",
    metricValue:
      "mt-6 text-2xl font-black tracking-tight text-foreground [font-variant-numeric:tabular-nums]",
    metricLabel: "mt-1 text-sm font-medium text-muted",
  },
});
