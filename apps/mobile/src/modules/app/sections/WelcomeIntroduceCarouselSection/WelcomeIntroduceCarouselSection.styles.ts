import { tv } from "tailwind-variants";

export const welcomeIntroduceCarouselSectionVariants = tv({
  slots: {
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden px-4",
    track: "flex h-full touch-pan-y",
  },
});
