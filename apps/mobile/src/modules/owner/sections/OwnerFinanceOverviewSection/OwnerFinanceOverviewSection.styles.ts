import { tv } from "tailwind-variants";

export const ownerFinanceOverviewSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-6",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    hero: "flex flex-col gap-2 rounded-[24px] border-0 bg-surface p-5",
    heroHeader: "flex items-center gap-2 text-muted",
    heroIcon: "shrink-0 text-accent",
    heroLabel: "text-muted",
    heroAmount: "text-foreground",
    heroHint: "text-muted",
    statsGrid: "grid grid-cols-2 gap-4",
    chartCard:
      "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    chartTitle: "text-foreground",
    chart: "w-full",
  },
});
