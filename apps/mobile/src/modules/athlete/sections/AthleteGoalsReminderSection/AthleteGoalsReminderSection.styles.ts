import { tv } from "tailwind-variants";

export const athleteGoalsReminderSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    form: "flex flex-col gap-3",
    meta: "text-muted",
    nativeSelect:
      "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent",
    quietRow: "grid grid-cols-2 gap-3",
    scopeRow: "flex items-center gap-2 text-sm text-foreground",
    list: "flex flex-col gap-3",
    row: "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3",
    rowTop: "flex items-start justify-between gap-2",
    empty: "border border-dashed border-border text-center text-muted",
  },
});
