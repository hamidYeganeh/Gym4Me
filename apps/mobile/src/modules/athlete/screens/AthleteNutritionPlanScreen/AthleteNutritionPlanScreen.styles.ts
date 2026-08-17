import { tv } from "tailwind-variants";

export const athleteNutritionPlanScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    metaRow: "flex flex-wrap items-center gap-2",
    dayCard:
      "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    dayTitle: "text-foreground",
    meal: "flex flex-col gap-2 rounded-[18px] border border-border bg-background p-3",
    mealTop: "flex items-start justify-between gap-2",
    item: "text-muted",
    macros: "text-muted",
    mealActions: "flex flex-wrap gap-2",
    meta: "text-muted",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  },
});
