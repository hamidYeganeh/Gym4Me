import { tv } from "tailwind-variants";

export const adminEvidenceGalleryVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    label: "text-sm font-medium text-foreground",
    empty: "text-sm text-muted",
    grid: "grid grid-cols-2 gap-2 sm:grid-cols-3",
    frame:
      "overflow-hidden rounded-xl border border-border bg-surface aspect-square",
    image: "h-full w-full object-cover",
    link: "inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline",
  },
});
