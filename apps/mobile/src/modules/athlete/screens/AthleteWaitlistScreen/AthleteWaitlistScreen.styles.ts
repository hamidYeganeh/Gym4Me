import { tv } from "tailwind-variants";

export const athleteWaitlistScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4 shadow-sm shadow-foreground/5",
    meta: "text-muted",
    actions: "flex flex-wrap gap-2",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center shadow-sm shadow-foreground/5",
  },
});
