import { tv } from "tailwind-variants";

export const athleteProgressPhotosScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    grid: "grid grid-cols-2 gap-3",
    card: "flex flex-col gap-2 rounded-[1.25rem] border-0 bg-surface p-3",
    thumb:
      "flex aspect-square items-center justify-center rounded-xl bg-accent/10 text-accent",
    image: "aspect-square w-full rounded-xl object-cover",
    error: "text-danger",
    skeleton: "aspect-square animate-pulse rounded-xl bg-surface-secondary",
    meta: "text-muted",
    empty:
      "flex flex-col items-center gap-2 rounded-[1.25rem] border-0 bg-surface px-6 py-10 text-center",
    actions: "flex flex-col gap-2",
    cardActions: "flex flex-col gap-2",
  },
});
