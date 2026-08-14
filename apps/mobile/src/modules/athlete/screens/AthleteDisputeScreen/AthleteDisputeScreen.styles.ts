import { tv } from "tailwind-variants";

export const athleteDisputeScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    card: "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    form: "flex flex-col gap-3",
    nativeSelect:
      "rounded-xl border border-border bg-background px-3 py-2.5 text-foreground",
    list: "flex flex-col gap-3",
    row: "flex flex-col gap-2 rounded-[1.25rem] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    rowTop: "flex items-center justify-between gap-2",
    meta: "text-muted",
    feedback: "text-success",
    error: "text-danger",
  },
});
