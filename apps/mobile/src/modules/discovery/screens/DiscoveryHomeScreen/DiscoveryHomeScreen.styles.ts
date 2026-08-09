export const discoveryHomeScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-7 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  quickNav: "grid grid-cols-3 gap-3",
  section: "flex flex-col gap-3",
  sectionHeader: "flex items-start justify-between gap-3",
  sectionTitle: "min-w-0 flex-1 text-foreground",
  sectionHint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  scroller:
    "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  featureSlide:
    "flex h-auto w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2 bg-transparent p-0 shadow-none",
  featureLabel: "text-center text-xs font-medium leading-snug text-muted",
  cityCard: "w-40 shrink-0 snap-start",
  clubCardVertical: "w-[min(17.5rem,78vw)] shrink-0 snap-start",
  clubCardHorizontal: "w-[min(20rem,85vw)] shrink-0 snap-start",
  coachCard: "w-[min(16rem,72vw)] shrink-0 snap-start",
  classCard: "w-72 shrink-0 snap-start",
  amenityCard:
    "h-auto w-[min(16rem,72vw)] shrink-0 snap-start bg-transparent p-0 shadow-none",
  sportCard: "w-56 shrink-0 snap-start",
  articleCard: "w-[min(17.5rem,78vw)] shrink-0 snap-start",
  galleryCard: "w-[10rem] shrink-0 snap-start",
  emptyInline: "px-1 text-muted",
} as const;

export const HOME_SPORT_COLORS = [
  "var(--stats-blue)",
  "var(--stats-orange)",
  "var(--stats-green)",
  "var(--accent)",
] as const;
