import { tv } from "tailwind-variants";

export const welcomeIntroduceCarouselSectionVariants = tv({
  slots: {
    carousel: "absolute inset-0 overflow-hidden bg-red-500",
    track: "flex h-full touch-pan-y",
  },
});
