export const discoveryClubsDetailHeroSectionStyles = {
  carousel: "relative h-[52dvh] min-h-80 w-full overflow-hidden",
  image: "object-cover object-center",
  scrim: [
    "pointer-events-none absolute inset-0",
    "bg-linear-to-t from-background/25 via-transparent to-background/20",
  ].join(" "),
  thumbs: [
    "pointer-events-auto absolute end-4 bottom-14 z-10",
    "flex shrink-0 flex-col gap-2.5",
  ].join(" "),
  thumbButton: [
    "relative h-14 w-12 min-w-0 overflow-hidden rounded-2xl border-2 bg-transparent p-0 shadow-none",
    "transition-[border-color,opacity,transform] duration-fast ease-app",
  ].join(" "),
  thumbActive: "border-surface opacity-100",
  thumbIdle: "border-surface/70 opacity-90",
  thumbImage: "object-cover",
  counter: [
    "pointer-events-none absolute start-4 bottom-14 z-10",
    "h-7 rounded-full border-0 bg-foreground/70 px-3 text-background",
    "shadow-sm backdrop-blur-md",
  ].join(" "),
  counterLabel: "text-[0.7rem] font-semibold tabular-nums text-background",
  sheet: [
    "relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem]",
    "bg-surface text-surface-foreground",
  ].join(" "),
  sheetHeader: [
    "flex items-start justify-between gap-4",
    "px-5 pb-2 pt-6",
  ].join(" "),
  titleBlock: "min-w-0 flex-1",
  title:
    "text-balance text-[1.65rem] leading-tight tracking-tight text-foreground",
  locationRow: "mt-2 flex items-center gap-1.5 text-muted",
  locationText: "truncate",
  ratingCard: [
    "flex shrink-0 flex-col items-center justify-center gap-0.75",
    "rounded-xl px-4 py-2.5",
  ].join(" "),
  ratingValue: "flex items-center gap-1 text-foreground",
  ratingScore: "text-base leading-none",
  ratingStar: "shrink-0 text-warning",
  ratingMeta: "text-[0.65rem] leading-none",
} as const;
