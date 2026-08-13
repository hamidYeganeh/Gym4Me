export const discoveryClubsScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-7 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  meta: "text-muted",
  section: "flex flex-col gap-3",
  sectionHeader: "flex items-center justify-between gap-3",
  sectionTitle: "min-w-0 flex-1 text-foreground",
  sectionHint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  scroller:
    "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  fullBleedScroller:
    "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  clubCardVertical: "w-[min(17.5rem,78vw)] shrink-0 snap-start",
  clubCardHorizontal: "w-[min(20rem,85vw)] shrink-0 snap-start",
  clubCardFullWidth: "w-[min(100%,calc(100vw-2.5rem))] shrink-0 snap-start",
  locationCard: "shrink-0 snap-start",
  stack: "flex flex-col gap-4",
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center shadow-sm shadow-foreground/5",
  emptyTitle: "text-foreground",
  emptyBody: "text-muted",
  emptyInline: "px-1 text-muted",
} as const;
