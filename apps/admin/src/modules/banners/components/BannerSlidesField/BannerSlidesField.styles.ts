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
    slideHeader: "flex flex-col gap-3",
    preview: "relative w-full overflow-hidden bg-muted/20",
    image: "h-full w-full object-cover",
    previewGradient:
      "pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent",
    previewTitle:
      "absolute z-10 max-w-[70%] text-balance text-sm font-bold text-white drop-shadow-md md:text-base",
    previewAction:
      "absolute z-10 max-w-[55%] rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg",
    fields: "flex flex-col gap-2",
    field: "flex flex-col gap-1.5",
    fieldRow: "flex items-center justify-between gap-3",
    chips: "flex flex-wrap gap-1.5",
    placementGrid: "grid grid-cols-3 gap-1.5",
    placementButton:
      "h-auto min-h-11 whitespace-normal px-2 py-1 text-center text-xs",
    uploadError: "text-sm text-danger",
  },
});
