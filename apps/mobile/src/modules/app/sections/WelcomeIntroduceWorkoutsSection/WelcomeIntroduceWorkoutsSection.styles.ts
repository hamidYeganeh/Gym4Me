import { tv } from "tailwind-variants";

export const welcomeIntroduceWorkoutsSectionVariants = tv({
  slots: {
    root: "relative mx-auto h-[min(50dvh,380px)] w-full max-w-screen-frame shrink-0",
    carousel: "h-full w-full overflow-hidden",
    track: "flex h-full touch-pan-y",
    slide:
      "flex h-full min-w-0 shrink-0 grow-0 basis-[78%] items-center justify-center px-2",
  },
});
