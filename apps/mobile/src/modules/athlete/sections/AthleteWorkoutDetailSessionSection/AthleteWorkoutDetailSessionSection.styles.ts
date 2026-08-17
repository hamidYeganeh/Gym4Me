import { tv } from "tailwind-variants";

export const athleteWorkoutDetailSessionSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    sessionCard:
      "flex flex-col gap-3 rounded-[24px] border border-warning/30 bg-warning/5 p-4",
    sessionForm: "flex flex-col gap-3",
    sessionGrid: "grid grid-cols-2 gap-3",
    field: "flex flex-col gap-1.5",
    nativeSelect:
      "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent",
    setList: "flex flex-col gap-1",
    cardTop: "flex items-start justify-between gap-2",
    meta: "text-muted",
    quickLog:
      "grid grid-cols-2 gap-2 rounded-3xl border border-border bg-surface p-3",
    error: "rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger",
  },
});
