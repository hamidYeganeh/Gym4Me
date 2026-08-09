import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubGalleryCardVariants = tv({
  slots: {
    root: [
      "group flex w-[9.75rem] shrink-0 flex-col gap-2.5 text-start",
      "bg-transparent text-foreground",
    ].join(" "),
    pressable: [
      "flex h-full w-full flex-col items-stretch justify-start gap-2.5",
      "rounded-none bg-transparent p-0 text-start text-foreground shadow-none",
      "data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    media: [
      "relative aspect-[3/4] h-auto w-full overflow-hidden rounded-[1.35rem]",
      "bg-background",
    ].join(" "),
    image: [
      "pointer-events-none absolute inset-0 size-full",
      "aspect-[3/4] h-auto w-full object-cover select-none",
    ].join(" "),
    badge: [
      "absolute end-2.5 top-2.5 z-10",
      "inline-flex items-center rounded-full bg-stats-orange px-2.5 py-0.5",
      "text-[0.7rem] font-semibold leading-none text-stats-foreground",
    ].join(" "),
    mediaIcon: [
      "pointer-events-none absolute inset-0 z-[1]",
      "flex items-center justify-center text-stats-foreground",
      "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
    ].join(" "),
    duration: [
      "pointer-events-none absolute bottom-2.5 start-2.5 z-10",
      "text-xs font-semibold tabular-nums tracking-wide text-stats-foreground",
      "drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]",
    ].join(" "),
    body: "flex min-w-0 flex-col gap-1 px-0.5",
    title: "line-clamp-1 text-sm font-bold leading-snug text-foreground",
    author: "line-clamp-1 text-xs leading-snug text-muted",
    views: "mt-0.5 inline-flex items-center gap-1 text-xs text-muted [&_svg]:shrink-0",
  },
});

export type ClubGalleryCardVariantProps = VariantProps<
  typeof clubGalleryCardVariants
>;
