import { tv } from "tailwind-variants";

export const welcomeIntroduceCarouselSectionVariants = tv({
  slots: {
    carousel: [
      "absolute inset-0 z-0 h-dvh w-full overflow-hidden",
      "[&_.swiper-wrapper]:h-full [&_.swiper-wrapper]:min-h-dvh",
      "[&_.swiper-slide]:h-full [&_.swiper-slide]:min-h-dvh",
    ].join(" "),
    slide: "h-full min-h-dvh w-full",
  },
});
