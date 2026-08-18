import { tv } from "tailwind-variants";

export const onboardingCarouselSectionVariants = tv({
  slots: {
    carousel: "absolute inset-0 overflow-hidden",
    track: "flex h-full touch-pan-y",
  },
});
