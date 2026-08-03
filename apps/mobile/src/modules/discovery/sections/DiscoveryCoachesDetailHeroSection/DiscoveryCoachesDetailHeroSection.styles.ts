export const discoveryCoachesDetailHeroSectionStyles = {
  root: "relative w-full",
  media: "relative h-[58dvh] min-h-100 w-full overflow-hidden",
  image: "object-cover object-center",
  scrim: [
    "pointer-events-none absolute inset-0",
    /* Theme fade into sheet + light top veil for control contrast on photos */
    "bg-linear-to-t from-background via-background/70 to-background/30",
  ].join(" "),
  topBar: [
    "absolute inset-x-0 top-0 z-10 grid grid-cols-[2.75rem_1fr_2.75rem] items-start gap-2",
    "px-4 pt-[max(0.75rem,env(safe-area-inset-top))]",
  ].join(" "),
  island: [
    "mx-auto inline-flex items-center gap-2.5 rounded-full",
    "border border-border/60 bg-surface/85 px-2.5 py-1.5",
    "shadow-md backdrop-blur-xl",
  ].join(" "),
  islandLogo: "size-7 shrink-0 text-accent",
  islandAvatar: "size-8 shrink-0",
  backButton: "shrink-0 shadow-md backdrop-blur-xl",
  inspo: [
    "absolute z-10 flex flex-col items-center gap-2",
    "end-4 top-[calc(max(0.75rem,env(safe-area-inset-top))+3.25rem)]",
  ].join(" "),
  inspoAdd: "size-9 min-w-0 rounded-full shadow-md backdrop-blur-md",
  inspoLabel: [
    "rounded-full bg-surface/70 px-2 py-0.5",
    "text-[0.65rem] font-semibold uppercase tracking-[0.18em]",
    "text-muted backdrop-blur-md",
  ].join(" "),
  inspoStack: "flex flex-col items-center gap-2",
  inspoThumb: [
    "relative size-10 overflow-hidden rounded-full p-0 shadow-md",
    "border-2 border-surface/80 bg-surface/50",
  ].join(" "),
  inspoImage: "object-cover",
  content: [
    "pointer-events-none absolute inset-x-0 bottom-0 z-10",
    "flex flex-col gap-3 px-5 pb-16",
  ].join(" "),
  pills: "pointer-events-auto flex flex-wrap items-center gap-2",
  pill: "h-8 rounded-full backdrop-blur-md",
  titleBlock: "min-w-0",
  title: "text-balance text-[2.15rem] leading-[1.05] tracking-tight",
  specialty: "mt-1.5",
  stats: "mt-2",
  sheet: [
    "relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem]",
    "bg-surface text-surface-foreground",
  ].join(" "),
} as const;
