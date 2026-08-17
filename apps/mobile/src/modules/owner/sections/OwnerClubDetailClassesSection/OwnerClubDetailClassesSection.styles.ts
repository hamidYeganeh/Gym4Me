import { tv } from "tailwind-variants";

export const ownerClubDetailClassesSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    title: "text-foreground",
    groupCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex w-full items-center gap-3 px-4 py-3.5",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowHint: "text-muted",
    divider: "mx-4 h-px bg-border",
    progress: "flex flex-col gap-1.5",
    progressRow: "flex items-center justify-between",
    progressLabel: "text-muted",
    progressValue: "text-sm font-medium text-foreground",
    progressTrack: "block h-1.5 w-full overflow-hidden rounded-full bg-default",
    progressFill: "block h-full rounded-full bg-accent",
  },
});
