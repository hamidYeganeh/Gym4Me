export const discoveryCoachesRecommendSectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-start justify-between gap-3 px-screen",
  titleBlock: "min-w-0 flex-1",
  title: "text-foreground",
  hint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  carousel:
    "relative z-10 min-w-0 -mx-screen w-[calc(100%+2*var(--screen-margin))] max-w-none overflow-hidden",
  slide: "!w-[min(78vw,280px)]",
  dots: "flex items-center justify-center gap-1.5 px-screen",
  dot: [
    "size-2 rounded-full bg-border transition-[width,background-color]",
    "duration-fast ease-app",
  ].join(" "),
  dotActive: "w-5 bg-accent",
  empty: "text-sm text-muted",
} as const;
