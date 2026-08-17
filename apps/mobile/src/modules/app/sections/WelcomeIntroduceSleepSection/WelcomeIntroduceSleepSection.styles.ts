import { tv } from "tailwind-variants";

export const welcomeIntroduceSleepSectionVariants = tv({
  slots: {
    root: "mx-auto flex w-full max-w-[21.5rem] shrink-0 flex-col gap-2.5",
    card: [
      "rounded-[1.25rem] bg-surface p-4",
      "ring-1 ring-border/60",
      "",
    ],
    breakdownHeader: "mb-3 flex items-center justify-between gap-2",
    breakdownTitle: "text-[0.75rem] font-semibold text-foreground",
    legend: "flex flex-wrap items-center justify-end gap-2.5",
    legendItem: "inline-flex items-center gap-1 text-[0.6875rem] text-muted",
    legendDot: "size-1.5 rounded-full",
    remDot: "bg-stats-purple",
    lightDot: "bg-stats-blue",
    deepDot: "bg-accent",
    awakeDot: "bg-default-foreground/40",
    bars: "grid grid-cols-4 gap-2",
    barCol: "flex flex-col gap-2",
    barTrack: "h-1 overflow-hidden rounded-full bg-default",
    barFill: "h-full rounded-full",
    remFill: "w-[66%] bg-stats-purple",
    lightFill: "w-[24%] bg-stats-blue",
    deepFill: "w-[11%] bg-accent",
    awakeFill: "w-[5%] bg-default-foreground/40",
    barMeta: "flex items-center justify-between text-[0.6875rem] text-muted",
    split: "grid grid-cols-[1.35fr_1fr] gap-2",
    qualityBody: "relative mt-2 flex h-[5.875rem] items-center justify-center",
    ring: "absolute inset-[8px] rounded-full border-[10px] border-default",
    ringAccent:
      "absolute inset-[8px] rounded-full border-[10px] border-transparent border-t-accent border-r-accent rotate-[-20deg]",
    qualityScoreWrap: "relative z-10 flex flex-col items-center",
    qualityScore: "text-[2.25rem] leading-none font-bold text-foreground",
    qualityStatus: "mt-1 text-[0.75rem] text-muted",
    streakGrid: "mt-2 grid grid-cols-8 gap-1.5",
    streakDot: "size-2.5 rounded-full bg-accent/85",
    streakDotMuted: "size-2.5 rounded-full bg-default",
    streakValue: "mt-3 text-[0.75rem] font-semibold text-foreground",
    insightCard: [
      "flex items-start gap-3 rounded-[1.25rem] bg-surface p-4",
      "ring-1 ring-border/60",
    ],
    insightIcon:
      "flex size-6 shrink-0 items-center justify-center text-accent",
    insightText: "text-[0.8125rem] leading-snug text-foreground",
  },
});
