import { tv } from "tailwind-variants";

export const analyticsFunnelSectionVariants = tv({
  slots: {
    card: "h-full rounded-[1.5rem] border border-border bg-surface shadow-none",
    cardHeader: "flex flex-col gap-1 border-b border-separator p-5 sm:p-6",
    cardTitle: "text-base font-bold text-foreground sm:text-lg",
    cardDescription: "text-sm leading-6 text-muted",
    content: "flex flex-col gap-1.5 p-5 sm:p-6",
    step: "flex flex-col gap-2",
    stepTop: "flex items-center justify-between gap-4",
    stepLabel: "text-sm font-bold text-foreground",
    stepCount:
      "text-sm font-black text-foreground [font-variant-numeric:tabular-nums]",
    track: "h-3 w-full overflow-hidden rounded-full bg-surface-secondary",
    fill: "block h-full rounded-full bg-accent",
    conversion: "flex items-center gap-2 py-1.5 ps-1",
    conversionLine: "h-4 w-px bg-separator",
  },
});
