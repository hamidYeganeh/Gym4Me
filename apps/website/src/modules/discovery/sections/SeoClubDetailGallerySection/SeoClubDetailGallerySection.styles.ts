export const seoClubDetailGallerySectionStyles = {
  root: "flex flex-col gap-4 border-t border-border pt-8",
  title: "tracking-tight text-foreground",
  grid: [
    "grid grid-cols-2 gap-3 sm:grid-cols-3",
    "list-none p-0",
  ].join(" "),
  item: [
    "group relative aspect-[4/3] overflow-hidden rounded-2xl",
    "bg-surface-secondary",
  ].join(" "),
  image: "size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]",
  caption: [
    "absolute inset-x-0 bottom-0",
    "bg-linear-to-t from-background/90 via-background/50 to-transparent",
    "px-3 pb-3 pt-8",
  ].join(" "),
  captionTitle: "line-clamp-2 text-sm font-semibold text-foreground",
  empty: "text-muted",
} as const;
