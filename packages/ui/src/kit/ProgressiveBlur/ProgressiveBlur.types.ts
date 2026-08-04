import type { HTMLMotionProps } from "motion/react";

export type ProgressiveBlurDirection = "top" | "right" | "bottom" | "left";

export type ProgressiveBlurProps = {
  /** Side where blur intensity peaks. */
  direction?: ProgressiveBlurDirection;
  /** Number of stacked blur bands (min 2). Defaults to `12`. */
  blurLayers?: number;
  /** Blur step per layer, in px. Defaults to `0.85`. */
  blurIntensity?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;
