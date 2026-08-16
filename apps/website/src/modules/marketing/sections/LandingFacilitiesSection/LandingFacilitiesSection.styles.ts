import { tv } from "tailwind-variants";

export const landingFacilitiesSectionStyles = tv({
  slots: {
    root: [
      "relative z-10 -mt-10 rounded-(--radius-card-lg) bg-background",
      "px-6 pt-16 pb-20 sm:px-10",
    ],
    intro: "max-w-xl",
    title:
      "mt-2 text-5xl font-bold leading-[0.95] tracking-tight text-foreground",
    body: "mt-6 max-w-[36rem] text-sm text-muted",
    block: "mt-12 flex flex-col gap-4",
    blockTitle: "text-lg font-semibold tracking-tight text-foreground",
    amenityRail:
      "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    amenityCard: "shrink-0",
    equipmentGrid: "flex flex-wrap gap-2",
    galleryRail:
      "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    galleryCard: "w-[10.5rem] shrink-0",
  },
});
