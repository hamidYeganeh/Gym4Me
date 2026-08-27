import { tv } from "tailwind-variants";

export const adminEvidenceGalleryVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    label: "text-sm font-medium text-foreground",
    empty: "text-sm text-muted",
    grid: "grid grid-cols-2 gap-2 sm:grid-cols-3",
    frame:
      "relative overflow-hidden rounded-xl border border-border bg-muted/10 aspect-[4/3]",
    image: "h-full w-full object-cover",
    embed: "pointer-events-none h-full w-full border-0",
    fallback:
      "absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center text-sm text-muted",
    hitTarget: "absolute inset-0 z-10",
    link: "inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline",
  },
});
