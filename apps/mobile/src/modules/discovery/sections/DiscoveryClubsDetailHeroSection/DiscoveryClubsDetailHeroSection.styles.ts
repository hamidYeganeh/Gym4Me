export const discoveryClubsDetailHeroSectionStyles = {
  carousel: "relative h-[58dvh] min-h-85 w-full overflow-hidden",
  image: "object-cover",
  scrim:
    "absolute inset-0 bg-linear-to-t from-background to-transparent",
  bottomBar:
    "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-14",
  titleBlock: "min-w-0 flex-1",
  title:
    "text-balance text-[1.75rem] leading-tight text-foreground drop-shadow-sm",
  locationRow: "mt-2 flex items-center gap-1.5 text-foreground",
  locationText: "truncate text-foreground/95",
  thumbs: "pointer-events-auto flex shrink-0 flex-col gap-2.5",
  thumbButton: [
    "relative h-14 w-12 min-w-0 overflow-hidden rounded-2xl border-2 bg-transparent p-0 shadow-none",
    "transition-[border-color,opacity,transform] duration-fast ease-app",
  ].join(" "),
  thumbActive: "border-foreground opacity-100",
  thumbIdle: "border-foreground/70 opacity-90",
  thumbImage: "object-cover",
  sheet: "relative z-10 -mt-10 rounded-t-[2.5rem] bg-surface",
} as const;
