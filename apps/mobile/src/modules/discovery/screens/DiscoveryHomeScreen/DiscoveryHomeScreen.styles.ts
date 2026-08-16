export const discoveryHomeScreenStyles = {
  root: "bg-background",
  headerSpacer:
    "pointer-events-none shrink-0 h-[calc(4rem+env(safe-area-inset-top))]",
  header: [
    "fixed top-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2",
    "overflow-hidden rounded-b-[2.5rem] bg-surface",
    "pt-[env(safe-area-inset-top)]",
  ].join(" "),
  headerBar: "relative flex min-h-16 items-center justify-center px-screen py-3",
  filterButton: [
    "absolute start-screen top-1/2 z-10 -translate-y-1/2",
    "rounded-[0.875rem] text-foreground",
  ].join(" "),
  searchButton: [
    "absolute end-screen top-1/2 z-10 -translate-y-1/2",
    "rounded-[0.875rem] text-foreground",
  ].join(" "),
  locationChip: [
    "h-9 gap-1.5 rounded-full bg-default px-3.5",
    "text-default-foreground shadow-none",
    "hover:bg-default/80 data-[hovered=true]:bg-default/80",
  ].join(" "),
  locationLabel: "max-w-[12rem] truncate text-sm font-medium",
  content: "flex flex-col gap-8 pb-12 pt-2",
  intro: "flex flex-col gap-2",
  introTitle: "text-balance tracking-tight text-foreground",
  introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
  quickNav: "grid grid-cols-2 gap-3",
  quickNavWide: "col-span-2",
  section: "flex flex-col gap-4",
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
  equipmentGrid: "flex flex-wrap gap-2",
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
