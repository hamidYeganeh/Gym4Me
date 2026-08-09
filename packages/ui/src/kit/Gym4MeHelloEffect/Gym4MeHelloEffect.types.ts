import type { motion } from "motion/react";
import type { ComponentProps } from "react";

export type Gym4MeHelloEffectProps = Omit<
  ComponentProps<typeof motion.svg>,
  "children"
> & {
  /**
   * Animation speed multiplier (higher = faster).
   * @defaultValue `1`
   */
  speed?: number;
  /** Called when the full handwriting animation completes. */
  onAnimationComplete?: () => void;
};
