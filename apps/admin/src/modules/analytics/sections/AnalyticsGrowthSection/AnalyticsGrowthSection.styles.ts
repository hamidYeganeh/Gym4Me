import { tv } from "tailwind-variants";

export const analyticsGrowthSectionVariants = tv({
  slots: {
    root: "grid gap-5 xl:grid-cols-2",
    card: "rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader:
      "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    chartContent: "p-5 sm:p-6",
    chart: "w-full",
  },
});
