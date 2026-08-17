import { tv } from "tailwind-variants";

export const coachClientDetailNotesSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    title: "text-foreground",
    noteCard: "rounded-[24px] border-0 bg-surface px-4 py-4",
    noteBody: "leading-7 text-muted",
  },
});
