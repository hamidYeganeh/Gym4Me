import { tv } from "tailwind-variants";

export const athleteSubscriptionScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-3",
    card: "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface p-4",
    cardCurrent: "ring-2 ring-accent/40",
    rowTop: "flex items-start justify-between gap-2",
    price: "text-accent",
    features: "flex flex-col gap-1 ps-4",
    feature: "text-muted list-disc",
    meta: "text-muted",
    actions: "flex flex-wrap gap-2",
  },
});
