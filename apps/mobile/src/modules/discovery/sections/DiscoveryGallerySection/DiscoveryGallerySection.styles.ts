export const discoveryGallerySectionStyles = {
  root: "flex flex-col gap-3",
  sectionHeader: "flex items-center justify-between gap-3",
  sectionTitleRow: "flex min-w-0 flex-1 items-center gap-2",
  sectionTitleIcon: "shrink-0 text-accent",
  sectionTitle: "min-w-0 flex-1 text-foreground",
  carousel: [
    "min-w-0 -mx-5 w-[calc(100%+2.5rem)] max-w-none overflow-hidden",
    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pe-[calc(env(safe-area-inset-right)+1rem)]",
    "[&_.swiper-wrapper]:px-5 [&_.swiper-wrapper]:pb-1",
  ].join(" "),
  swiperSlide: "!w-auto !h-auto",
  slide: "min-w-0",
  seeAll: [
    "flex h-[min(17.5rem,calc(100vw*0.55))] w-[9.75rem]",
    "flex-col items-center justify-center gap-2",
    "rounded-[1.35rem] border border-border/70 bg-default text-foreground",
    "transition-transform duration-fast ease-app",
    "data-[pressed=true]:scale-[0.98]",
  ].join(" "),
  seeAllLabel: "text-center text-sm font-semibold",
} as const;
