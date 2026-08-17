import { tv } from "tailwind-variants";

export const dashboardHomeMetricsSectionVariants = tv({
  slots: {
    metricsRail:
      "overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-none",
    metricsContent:
      "grid p-0 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-x-reverse xl:divide-separator",
    metric:
      "flex min-h-40 flex-col justify-between border-b border-separator p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-e sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:border-e-0",
    metricTop: "flex items-center justify-between gap-4",
    metricIcon:
      "flex size-10 items-center justify-center rounded-xl bg-surface-secondary text-foreground",
    metricValue:
      "mt-6 text-2xl font-black tracking-tight text-foreground [font-variant-numeric:tabular-nums]",
    metricLabel: "mt-1 text-sm font-medium text-muted",
  },
  variants: {
    tone: {
      accent: { metricIcon: "bg-accent/12 text-accent" },
      success: { metricIcon: "bg-success/12 text-success" },
      warning: { metricIcon: "bg-warning/12 text-warning" },
      neutral: { metricIcon: "bg-surface-secondary text-muted" },
    },
  },
  defaultVariants: { tone: "neutral" },
});
