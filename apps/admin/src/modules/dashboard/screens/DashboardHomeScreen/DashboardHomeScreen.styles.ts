import { tv } from "tailwind-variants";

export const dashboardHomeScreenVariants = tv({
  slots: {
    root: "min-h-dvh",
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro:
      "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
    introCopy: "min-w-0",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base",
    introActions: "flex shrink-0 items-center gap-3",
    sampleLabel:
      "rounded-full border border-warning/25 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning",
    metricsRail:
      "overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-none",
    metricsContent:
      "grid p-0 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-x-reverse xl:divide-separator",
    metric:
      "flex min-h-40 flex-col justify-between border-b border-separator p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-e sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:border-e-0",
    metricTop: "flex items-center justify-between gap-4",
    metricIcon:
      "flex size-10 items-center justify-center rounded-xl bg-surface-secondary text-foreground",
    metricTrend:
      "flex items-center gap-1 text-xs font-bold [font-variant-numeric:tabular-nums]",
    metricValue:
      "mt-6 text-2xl font-black tracking-tight text-foreground [font-variant-numeric:tabular-nums]",
    metricLabel: "mt-1 text-sm font-medium text-muted",
    primaryGrid: "grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.7fr)]",
    secondaryGrid:
      "grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]",
    revenueCard:
      "min-h-[25rem] rounded-[1.5rem] border border-border bg-surface shadow-none",
    queueCard:
      "rounded-[1.5rem] border border-border bg-surface shadow-none",
    activityCard:
      "rounded-[1.5rem] border border-border bg-surface shadow-none",
    healthCard:
      "rounded-[1.5rem] border border-border bg-surface-secondary shadow-none",
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
    activityContent: "grid gap-0 p-0 sm:grid-cols-3",
    activityItem:
      "flex items-start gap-3 border-b border-separator p-5 last:border-b-0 sm:border-b-0 sm:border-e sm:last:border-e-0",
    activityIcon:
      "flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted",
    activityCopy: "flex min-w-0 flex-col gap-1",
    activityTitle: "text-sm font-bold leading-6 text-foreground",
    activityMeta: "text-xs leading-5 text-muted",
    healthHeader:
      "flex flex-row items-start justify-between gap-4 border-b border-separator p-5 sm:p-6",
    healthScore:
      "text-2xl font-black text-success [font-variant-numeric:tabular-nums]",
    healthContent: "flex flex-col gap-3 p-5 sm:p-6",
    healthRow:
      "flex items-center justify-between gap-4 text-sm font-semibold text-foreground",
    healthStatus: "text-xs font-bold text-success",
  },
  variants: {
    tone: {
      accent: {
        metricIcon: "bg-accent/12 text-accent",
        queueIcon: "bg-accent/12 text-accent",
        activityIcon: "bg-accent/12 text-accent",
      },
      success: {
        metricIcon: "bg-success/12 text-success",
        queueIcon: "bg-success/12 text-success",
        activityIcon: "bg-success/12 text-success",
      },
      warning: {
        metricIcon: "bg-warning/12 text-warning",
        queueIcon: "bg-warning/12 text-warning",
        activityIcon: "bg-warning/12 text-warning",
      },
      danger: {
        metricIcon: "bg-danger/12 text-danger",
        queueIcon: "bg-danger/12 text-danger",
        activityIcon: "bg-danger/12 text-danger",
      },
      neutral: {
        metricIcon: "bg-surface-secondary text-muted",
        queueIcon: "bg-surface-secondary text-muted",
        activityIcon: "bg-surface-secondary text-muted",
      },
    },
    direction: {
      up: { metricTrend: "text-success" },
      down: { metricTrend: "text-warning" },
    },
    state: {
      operational: { healthStatus: "text-success" },
      warning: { healthStatus: "text-warning" },
    },
  },
  defaultVariants: {
    direction: "up",
    state: "operational",
    tone: "neutral",
  },
});
