import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachFeatureCardVariants = tv({
  slots: {
    root: "relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[28px]",
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    mediaScrim:
      "pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/75 to-transparent",
    topBar: "relative z-10 flex w-full items-start justify-between gap-3 p-3",
    newBadge: [
      "h-7 border-0 px-2.5",
      "[--chip-bg:var(--foreground)] [--chip-fg:var(--background)]",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
    ].join(" "),
    closeButton: [
      "size-9 shrink-0 rounded-full bg-white/90 text-foreground shadow-sm",
      "hover:bg-white data-[hovered=true]:bg-white",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
    body: "relative z-10 mt-auto flex w-full min-w-0 flex-col gap-1.5 p-4 pt-10",
    title: "tracking-tight text-foreground",
    specialty: "text-muted",
    ratingRow: "flex items-center gap-1.5",
    stars: "flex items-center gap-0.5",
    star: "shrink-0 text-warning",
    starEmpty: "shrink-0 text-muted/40",
    ratingText: "text-sm text-foreground",
    ratingCount: "text-muted",
    meta: "mt-0.5 flex flex-wrap items-center gap-3",
    metaItem:
      "inline-flex items-center gap-1 text-xs font-medium text-foreground",
    metaIconSuccess: "size-3.5 shrink-0 text-success",
    metaIconMuted: "size-3.5 shrink-0 text-muted",
  },
});

export type CoachFeatureCardVariantProps = VariantProps<
  typeof coachFeatureCardVariants
>;
