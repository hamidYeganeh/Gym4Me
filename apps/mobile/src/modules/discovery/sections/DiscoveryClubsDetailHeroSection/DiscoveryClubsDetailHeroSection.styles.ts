export const discoveryClubsDetailHeroSectionStyles = {
  carousel: "relative h-[52dvh] min-h-80 w-full overflow-hidden",
  image: "object-cover object-center",
  scrim: [
    "pointer-events-none absolute inset-0",
    "bg-linear-to-t from-background/25 via-transparent to-background/20",
  ].join(" "),
  navigation: [
    "pointer-events-auto absolute end-4 bottom-14 z-10",
    "shrink-0",
  ].join(" "),
  counter: [
    "pointer-events-none absolute start-4 bottom-14 z-10",
    "h-7 rounded-full border-0 bg-foreground/70 px-3 text-background",
    "shadow-sm backdrop-blur-md",
  ].join(" "),
  counterLabel: "text-[0.7rem] font-semibold tabular-nums text-background",
  sheet: [
    // overflow-x only — vertical overflow:hidden breaks sticky timeline badges.
    "relative z-10 -mt-10 overflow-x-clip rounded-t-[2.5rem]",
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
  metaRow: "mt-3 flex flex-wrap items-center gap-2",
  openChip: [
    "h-7 rounded-full border-0 bg-success/15 px-2.5",
    "text-success shadow-none",
  ].join(" "),
  closedChip: [
    "h-7 rounded-full border-0 bg-danger/15 px-2.5",
    "text-danger shadow-none",
  ].join(" "),
  hoursText: "text-[0.8rem] tabular-nums tracking-tight",
  ratingCard: [
    "flex shrink-0 flex-col items-center justify-center gap-0.75",
    "rounded-[1.15rem] px-4 py-2.5",
  ].join(" "),
  ratingValue: "flex items-center gap-1 text-foreground",
  ratingScore: "text-base leading-none",
  ratingStar: "shrink-0 text-warning",
  ratingMeta: "text-[0.65rem] leading-none",
} as const;
