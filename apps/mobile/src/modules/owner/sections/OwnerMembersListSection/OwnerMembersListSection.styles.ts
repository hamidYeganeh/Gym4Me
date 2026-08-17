import { tv } from "tailwind-variants";

export const ownerMembersListSectionVariants = tv({
  slots: {
    search: "w-full",
    groupCard:
      "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex w-full items-start gap-3 px-4 py-3.5",
    avatar:
      "size-11 shrink-0 overflow-hidden rounded-full bg-default object-cover",
    rowBody: "flex min-w-0 flex-1 flex-col gap-1",
    rowTop: "flex items-center gap-2",
    rowName: "truncate text-foreground",
    rowPlan: "truncate text-muted",
    rowMeta: "text-muted",
    progress: "flex flex-col gap-1.5 pt-1",
    progressRow: "flex items-center justify-between",
    progressLabel: "text-muted",
    progressValue: "text-sm font-medium text-foreground",
    progressTrack: "block h-1.5 w-full overflow-hidden rounded-full bg-default",
    progressFill: "block h-full rounded-full bg-accent",
    rowEnd: "flex shrink-0 flex-col items-end gap-2",
    divider: "mx-4 h-px bg-border",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
    emptyTitle: "text-foreground",
    emptyBody: "text-muted",
  },
});
