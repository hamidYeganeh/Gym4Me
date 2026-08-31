import { tv } from "tailwind-variants";

export const coachProgramsListSectionVariants = tv({
  slots: {
    list: "flex flex-col gap-4",
    card: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    cardTop: "flex items-start justify-between gap-2",
    cardTitle: "text-foreground",
    cardFocus: "text-muted",
    metaRow: "flex flex-wrap items-center gap-x-4 gap-y-1.5",
    metaItem: "inline-flex items-center gap-1.5 text-muted",
    metaIcon: "shrink-0 text-muted",
    updated: "text-muted",
    empty: "flex flex-col items-center gap-2 border-0 bg-surface text-center",
    emptyTitle: "text-foreground",
    emptyBody: "text-muted",
  },
});
