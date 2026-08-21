import { tv } from "tailwind-variants";

export const welcomeIntroduceCarouselSectionVariants = tv({
  slots: {
    carousel: "absolute inset-0 overflow-hidden !h-full",
    slide: "!h-full",
  },
});
