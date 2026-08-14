import { tv } from "tailwind-variants";

export const athletePassesScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    tabs: "flex flex-wrap gap-2",
    section: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    rowTop: "flex items-center justify-between gap-2",
    meta: "text-muted",
    list: "flex flex-col gap-3",
    actions: "flex flex-wrap gap-2",
    feedback: "text-success",
  },
});
