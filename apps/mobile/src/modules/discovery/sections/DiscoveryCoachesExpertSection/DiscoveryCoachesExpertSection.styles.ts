export const discoveryCoachesExpertSectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-start justify-between gap-3 px-screen",
  titleBlock: "min-w-0 flex-1",
  title: "text-foreground",
  hint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  scroller:
    "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  card: "w-[6.5rem] shrink-0 snap-start",
} as const;
