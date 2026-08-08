import { tv } from "tailwind-variants";

export const basicsMediaFieldVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    label: "text-sm font-medium text-foreground",
    hint: "text-xs text-muted",
    stack: "flex flex-col gap-3",
    preview:
      "flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border",
    image: "size-14 shrink-0 rounded-xl object-cover",
    typeWrap: "shrink-0",
  },
});
