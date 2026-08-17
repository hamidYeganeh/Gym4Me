import { tv } from "tailwind-variants";

export const articleDetailHeroSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-3xl bg-surface p-5",
    categoryChip:
      "inline-flex w-fit items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-semibold text-eclipse",
    title: "tracking-tight text-foreground",
    meta: "flex flex-wrap items-center gap-2 text-sm text-muted",
    authorRow: "flex items-center gap-2",
    authorName: "text-sm text-muted",
  },
});
