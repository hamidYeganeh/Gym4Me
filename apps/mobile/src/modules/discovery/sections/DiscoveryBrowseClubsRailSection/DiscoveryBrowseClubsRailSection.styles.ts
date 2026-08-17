import { tv } from "tailwind-variants";

export const discoveryBrowseClubsRailSectionVariants = tv({
  slots: {
    scroller:
      "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    fullBleedScroller:
      "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    cardVertical: "w-[min(17.5rem,78vw)] shrink-0 snap-start",
    cardHorizontal: "w-[min(20rem,85vw)] shrink-0 snap-start",
    cardFullWidth: "w-[min(100%,calc(100vw-2.5rem))] shrink-0 snap-start",
  },
});
