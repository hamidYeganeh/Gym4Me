import { tv } from "tailwind-variants";

export const welcomeIntroduceAchievementsSectionVariants = tv({
  slots: {
    root: "relative mx-auto mt-auto h-[min(48dvh,360px)] w-full max-w-[22rem] shrink-0",
    card: "absolute w-[42%] will-change-transform",
    left: "bottom-[8%] start-[0%] z-10",
    center: "bottom-[2%] left-1/2 z-30 w-[46%] -translate-x-1/2",
    right: "bottom-[8%] end-[0%] z-20",
  },
});
