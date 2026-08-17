import { tv } from "tailwind-variants";

export const discoveryBrowseCoachesLocationsSectionVariants = tv({
  slots: {
    scroller:
      "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    locationCard: "shrink-0 snap-start",
  },
});
