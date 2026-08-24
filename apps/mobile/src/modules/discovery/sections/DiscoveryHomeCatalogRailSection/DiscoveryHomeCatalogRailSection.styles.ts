import { tv } from "tailwind-variants";

export const discoveryHomeCatalogRailSectionVariants = tv({
  slots: {
    card: [
      "group relative flex h-44 w-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl",
      "border border-divider bg-default-100 text-start shadow-sm",
    ],
    image:
      "absolute inset-0 size-full object-cover transition-transform group-hover:scale-105",
    overlay:
      "absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent",
    body: "relative mt-auto flex w-full flex-col gap-1 p-3 text-white",
    eyebrow: "text-[11px] font-medium text-white/75",
    title: "line-clamp-2 text-sm font-bold leading-5",
    meta: "line-clamp-1 text-xs text-white/80",
    emptyImage:
      "absolute inset-0 bg-gradient-to-br from-primary/35 via-accent/20 to-default-200",
  },
  variants: {
    variant: {
      portrait: {
        card: "h-52 w-40",
        title: "text-base",
      },
      media: {
        card: "h-44 w-48",
      },
      schedule: {
        card: "h-36 w-64 bg-gradient-to-br from-primary/20 via-surface to-accent/10",
        body: "text-foreground",
        eyebrow: "text-foreground-500",
        meta: "text-foreground-600",
        overlay: "hidden",
      },
      tile: {
        card: "h-28 w-40 bg-gradient-to-br from-default-100 to-default-200",
        body: "text-foreground",
        eyebrow: "text-foreground-500",
        meta: "text-foreground-600",
        overlay: "hidden",
      },
      pricing: {
        card: "h-40 w-52 bg-gradient-to-br from-accent/15 via-surface to-primary/15",
        body: "text-foreground",
        eyebrow: "text-foreground-500",
        meta: "text-primary",
        overlay: "hidden",
      },
    },
  },
  defaultVariants: {
    variant: "media",
  },
});
