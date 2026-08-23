import { tv } from "tailwind-variants";

export const welcomeIntroduceCarouselSectionVariants = tv({
  slots: {
    carousel: [
      "absolute inset-0 z-0 h-full min-h-0 w-full overflow-hidden",
      "[&_.swiper-wrapper]:h-full [&_.swiper-wrapper]:min-h-0",
      "[&_.swiper-slide]:h-full [&_.swiper-slide]:min-h-0",
    ].join(" "),
    slide: "h-full min-h-0 w-full",
  },
});
