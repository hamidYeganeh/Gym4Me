import { tv } from "tailwind-variants";

export const bannerSlidesFieldVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    label: "text-sm font-medium text-foreground",
    hint: "text-xs text-muted",
    empty: "text-sm text-muted",
    list: "flex flex-col gap-3",
    slide:
      "flex flex-col gap-3 rounded-2xl border border-border/70 bg-default p-3",
    slideHeader: "flex items-start justify-between gap-3",
    preview: "h-20 w-40 shrink-0 overflow-hidden rounded-xl bg-muted/20",
    image: "h-full w-full object-cover",
    fields: "flex flex-col gap-2",
    field: "flex flex-col gap-1.5",
    fieldRow: "flex items-center justify-between gap-3",
    chips: "flex flex-wrap gap-1.5",
    uploadError: "text-sm text-danger",
  },
});
