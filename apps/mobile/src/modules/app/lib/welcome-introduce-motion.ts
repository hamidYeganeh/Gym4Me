import { spring, stagger } from "@repo/theme";
import type { Variants } from "motion/react";

/** Replay stagger each time a slide becomes the Embla selection. */
export const welcomeIntroduceSlideStackVariants: Variants = {
  inactive: {},
  active: {
    transition: {
      staggerChildren: stagger.children,
      delayChildren: stagger.delayChildren,
    },
  },
};

export const welcomeIntroduceFadeUpVariants: Variants = {
  inactive: { opacity: 0, y: 18 },
  active: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
};
