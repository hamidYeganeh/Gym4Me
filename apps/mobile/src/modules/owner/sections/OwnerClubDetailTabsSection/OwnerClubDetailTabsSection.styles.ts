import { tv } from "tailwind-variants";

export const ownerClubDetailTabsSectionVariants = tv({
  slots: {
    root: "-mx-screen flex gap-2.5 overflow-x-auto px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    tabChip: "shrink-0 rounded-full",
  },
});
