import { tv } from "tailwind-variants";

import { discoveryHomeCarouselClassNames } from "../../lib/discovery-home-carousel";

export const discoveryRelatedItemsSectionVariants = tv({
  slots: {
    root: [
      "relative isolate overflow-hidden",
      "-mx-screen w-[calc(100%+2*var(--screen-margin))] max-w-none",
      "rounded-[1.75rem] bg-accent px-screen py-6",
      "text-accent-foreground",
    ].join(" "),
    skyline:
      "pointer-events-none absolute inset-x-0 bottom-0 h-[5.5rem] text-accent-foreground opacity-[0.14] dark:opacity-10",
    header: "relative z-10 flex items-start justify-between gap-4",
    titleBlock: "min-w-0 flex-1",
    title: "text-accent-foreground",
    hint: "text-accent-foreground/75",
    nav: "flex shrink-0 items-center gap-2",
    navButton: [
      "size-9 min-w-9 rounded-xl bg-background text-muted shadow-none",
      "hover:bg-background data-[hovered=true]:bg-background",
      "dark:bg-surface dark:text-muted dark:hover:bg-surface",
      "dark:data-[hovered=true]:bg-surface",
    ].join(" "),
    scroller: [
      "relative z-10 mt-5",
      discoveryHomeCarouselClassNames.carousel,
      "mx-0 w-full",
    ].join(" "),
    swiper: discoveryHomeCarouselClassNames.swiper,
    slide: "!w-auto",
    item: [
      "inline-flex !h-auto min-h-11 max-w-[16rem] shrink-0 items-center justify-center",
      "whitespace-normal rounded-2xl bg-background px-4 py-3 text-center",
      "text-sm leading-snug font-medium text-foreground shadow-none",
      "hover:bg-background data-[hovered=true]:bg-background",
      "dark:bg-surface dark:text-foreground",
      "dark:hover:bg-surface dark:data-[hovered=true]:bg-surface",
      "[&.button--lg]:!h-auto [&.button--md]:!h-auto",
    ].join(" "),
  },
});
