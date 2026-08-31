import { tv } from "tailwind-variants";

export const achievementsHistorySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "px-1 text-muted",
    card: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex items-center gap-3 px-4 py-3.5",
    body: "flex min-w-0 flex-1 flex-col gap-0.5",
    label: "truncate text-sm text-foreground",
    date: "text-xs text-muted",
    amountPositive: "shrink-0 text-sm font-bold tabular-nums text-success",
    amountNegative: "shrink-0 text-sm font-bold tabular-nums text-danger",
    divider: "mx-4 h-px bg-border last:hidden",
    empty: "text-center text-muted",
  },
});
