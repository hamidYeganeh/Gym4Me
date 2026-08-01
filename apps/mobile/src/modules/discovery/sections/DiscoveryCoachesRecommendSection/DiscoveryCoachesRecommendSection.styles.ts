export const discoveryCoachesRecommendSectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-center justify-between gap-3 px-screen",
  title: "text-foreground",
  seeAll:
    "cursor-pointer text-sm font-semibold text-warning no-underline shadow-none",
  carousel:
    "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  slide: "w-[min(78vw,280px)] shrink-0 snap-center",
  dots: "flex items-center justify-center gap-1.5 px-screen",
  dot: [
    "size-2 rounded-full bg-border transition-[width,background-color]",
    "duration-fast ease-app",
  ].join(" "),
  dotActive: "w-5 bg-warning",
  empty: "px-screen text-sm text-muted",
} as const;
