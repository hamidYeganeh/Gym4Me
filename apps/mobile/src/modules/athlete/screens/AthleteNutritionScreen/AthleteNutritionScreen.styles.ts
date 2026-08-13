import { tv } from "tailwind-variants";

export const athleteNutritionScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    toolbar: "flex gap-2",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-4 text-start",
    cardTop: "flex items-start justify-between gap-2",
    title: "text-foreground",
    meta: "text-muted",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border border-border bg-surface px-6 py-10 text-center",
  },
});
