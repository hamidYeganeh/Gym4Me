import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const achievementsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-7 pb-12 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    summaryCard:
      "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5 shadow-sm shadow-foreground/5",
    summaryBalance: "flex flex-col items-center gap-1 text-center",
    summaryBalanceValue: "text-4xl font-bold tabular-nums text-foreground",
    summaryBalanceLabel: "text-muted",
    summaryStats:
      "flex items-stretch justify-around gap-2 border-t border-border pt-4",
    summaryStat: "flex flex-1 flex-col items-center gap-0.5 text-center",
    summaryStatValue: "text-lg font-bold tabular-nums text-foreground",
    summaryStatLabel: "text-xs text-muted",
    section: "flex flex-col gap-3",
    sectionTitle: "px-1 text-muted",
    grid: "grid grid-cols-3 gap-3",
    gridItem:
      "flex flex-col items-center gap-2 rounded-[20px] border-0 bg-surface p-3 text-center shadow-sm shadow-foreground/5",
    gridItemLocked: "opacity-45",
    gridItemTitle: "line-clamp-2 text-xs font-medium text-foreground",
    gridItemMeta: "text-[11px] tabular-nums text-muted",
    historyCard:
      "overflow-hidden rounded-[24px] border-0 bg-surface shadow-sm shadow-foreground/5",
    historyRow: "flex items-center gap-3 px-4 py-3.5",
    historyBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    historyLabel: "truncate text-sm text-foreground",
    historyDate: "text-xs text-muted",
    historyAmountPositive:
      "shrink-0 text-sm font-bold tabular-nums text-success",
    historyAmountNegative:
      "shrink-0 text-sm font-bold tabular-nums text-danger",
    divider: "mx-4 h-px bg-border last:hidden",
    state: "py-16 text-center text-muted",
  },
});

export type AchievementsScreenVariants = VariantProps<
  typeof achievementsScreenVariants
>;
