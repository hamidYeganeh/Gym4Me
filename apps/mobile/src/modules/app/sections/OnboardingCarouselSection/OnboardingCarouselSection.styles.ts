import { tv } from "tailwind-variants";

export const onboardingCarouselSectionVariants = tv({
  slots: {
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden",
    track: "flex h-full touch-pan-y",
  },
});
