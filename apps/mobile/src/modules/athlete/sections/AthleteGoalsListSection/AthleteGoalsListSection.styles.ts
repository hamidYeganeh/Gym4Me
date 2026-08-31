import { tv } from "tailwind-variants";

export const athleteGoalsListSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    list: "flex flex-col gap-3",
    row: "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3",
    rowTop: "flex items-start justify-between gap-2",
    meta: "text-muted",
    empty: "border border-dashed border-border text-center text-muted",
  },
});
