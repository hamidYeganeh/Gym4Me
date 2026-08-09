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

export const welcomeIntroduceStageItemVariants: Variants = {
  inactive: { opacity: 0, y: 28, scale: 0.94 },
  active: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.gentle,
  },
};
