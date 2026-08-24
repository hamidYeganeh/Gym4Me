import { tv } from "tailwind-variants";

export const adminEvidenceGalleryVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    label: "text-sm font-medium text-foreground",
    empty: "text-sm text-muted",
    grid: "grid grid-cols-2 gap-2 sm:grid-cols-3",
    frame:
      "relative overflow-hidden rounded-xl border border-border bg-muted/10 aspect-[4/3] before:absolute before:inset-0 before:grid before:place-items-center before:text-sm before:text-muted before:content-['مشاهده_فایل']",
    image: "h-full w-full object-cover",
    link: "inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline",
  },
});
