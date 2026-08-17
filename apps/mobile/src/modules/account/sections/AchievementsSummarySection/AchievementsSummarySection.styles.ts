import { tv } from "tailwind-variants";

export const achievementsSummarySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    balance: "flex flex-col items-center gap-1 text-center",
    balanceValue: "text-4xl font-bold tabular-nums text-foreground",
    balanceLabel: "text-muted",
    stats: "flex items-stretch justify-around gap-2 border-t border-border pt-4",
    stat: "flex flex-1 flex-col items-center gap-0.5 text-center",
    statValue: "text-lg font-bold tabular-nums text-foreground",
    statLabel: "text-xs text-muted",
  },
});
