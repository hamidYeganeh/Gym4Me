export const discoveryClubsClassDetailHeroSectionStyles = {
  root: "relative w-full",
  media: "relative h-[42dvh] min-h-72 w-full overflow-hidden",
  image: "object-cover object-top",
  scrim: "absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-black/35",
  sheet: [
    "relative z-10 -mt-16 px-4",
  ].join(" "),
  card: [
    "rounded-[1.75rem] border border-border/60 bg-surface px-5 pb-5 pt-4",
    "shadow-[0_12px_40px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
  ].join(" "),
  categoryRow: "flex justify-center",
  categoryChip: [
    "h-8 gap-1.5 rounded-full border-0 px-3",
    "[--chip-bg:color-mix(in_oklch,var(--stats-orange)_14%,transparent)]",
    "[--chip-fg:var(--stats-orange)]",
    "[&_.chip__label]:font-semibold",
  ].join(" "),
  categoryIcon: "text-stats-orange",
  title: "mt-3 text-center text-[1.55rem] leading-tight tracking-tight text-foreground",
  tagline: "mt-2 text-center text-sm italic leading-relaxed text-muted",
  stats: "mt-5 grid grid-cols-3 gap-2",
  stat: "flex min-w-0 flex-col items-center gap-1.5 text-center",
  statIconWrap: [
    "flex size-9 items-center justify-center rounded-full",
    "bg-default text-foreground",
  ].join(" "),
  statValue: "text-[0.8rem] font-semibold leading-snug text-foreground",
} as const;
