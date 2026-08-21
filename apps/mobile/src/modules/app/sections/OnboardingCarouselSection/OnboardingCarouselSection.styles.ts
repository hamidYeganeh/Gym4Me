import { tv } from "tailwind-variants";

export const onboardingCarouselSectionVariants = tv({
  slots: {
    carousel: [
      "absolute inset-0 z-0 h-full w-full overflow-hidden",
      "[&_.swiper-wrapper]:h-full",
      "[&_.swiper-slide]:h-full",
    ].join(" "),
    slide: "h-full w-full",
  },
});
