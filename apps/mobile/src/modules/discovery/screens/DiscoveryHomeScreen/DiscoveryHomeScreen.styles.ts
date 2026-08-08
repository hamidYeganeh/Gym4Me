export const discoveryHomeScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-7 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  quickNav: "grid grid-cols-3 gap-3",
  section: "flex flex-col gap-3",
  sectionHeader: "flex items-center justify-between gap-3",
  sectionTitle: "text-foreground",
  seeAll:
    "cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  scroller:
    "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  provinceCard: "w-40 shrink-0 snap-start",
  cityCard: "w-40 shrink-0 snap-start",
  sportCategoryCard: "w-64 shrink-0 snap-start",
  sportCard: "w-56 shrink-0 snap-start",
  clubCard: "w-72 shrink-0 snap-start",
  classCard: "w-72 shrink-0 snap-start",
  coachList: "overflow-hidden rounded-[24px] border border-border bg-surface",
  coachDivider: "mx-4 h-px bg-border last:hidden",
  emptyInline: "px-1 text-muted",
} as const;

export const HOME_SPORT_COLORS = [
  "var(--stats-blue)",
  "var(--stats-orange)",
  "var(--stats-green)",
  "var(--accent)",
] as const;
