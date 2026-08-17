import { tv } from "tailwind-variants";

export const coachClientDetailSessionsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "text-foreground",
    groupCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex items-center justify-between gap-3 px-4 py-3.5",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowTitle: "truncate text-foreground",
    rowMeta: "text-muted",
    divider: "mx-4 h-px bg-border last:hidden",
    emptyRow: "px-4 py-6 text-center text-muted",
  },
});
