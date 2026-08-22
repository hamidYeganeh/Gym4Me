export const discoveryCoachesExpertSectionStyles = {
  root: "flex flex-col gap-3",
  header: "flex items-start justify-between gap-3 px-screen",
  titleBlock: "min-w-0 flex-1",
  title: "text-foreground",
  hint: "text-muted",
  seeAll:
    "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
  scroller:
    "relative z-10 min-w-0 -mx-screen w-[calc(100%+2*var(--screen-margin))] max-w-none overflow-hidden",
  slide: "!w-[6.5rem]",
  card: "!w-full",
} as const;
