import { tv } from "tailwind-variants";

export const welcomeIntroduceActivitiesSectionVariants = tv({
  slots: {
    root: "relative mx-auto h-[min(42dvh,340px)] w-full max-w-[22rem] shrink-0 overflow-visible",
    card: "absolute w-[9.75rem] will-change-transform",
    /** Bottom-anchored fan so rotated cards stay inside the stage. */
    cycling: "bottom-[30%] start-[2%] z-20",
    kickboxing: "bottom-[2%] start-[16%] z-10",
    swimming: "bottom-[18%] end-[0%] z-30",
  },
});
