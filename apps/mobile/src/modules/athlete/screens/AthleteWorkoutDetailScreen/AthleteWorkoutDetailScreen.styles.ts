import { tv } from "tailwind-variants";

export const athleteWorkoutDetailScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    metaRow: "flex flex-wrap items-center gap-2",
    sectionTitle: "text-muted",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-2 rounded-[24px] border-0 bg-surface p-4",
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
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  },
});
