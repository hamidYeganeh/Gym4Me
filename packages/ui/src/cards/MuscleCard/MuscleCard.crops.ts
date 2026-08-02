import type { CSSProperties } from "react";
import type { MuscleArtArea } from "./art";

/**
 * Figma crop insets for the shared 235.13×473 anatomy diagram inside the
 * 88×128 card viewport (from Body Anatomy Muscle component).
 */
export const muscleArtCrops: Record<MuscleArtArea, CSSProperties> = {
  abs: {
    inset:
      "calc(-84.38% - 2.69px) calc(-83.1% - 2.66px) calc(-185.16% - 4.7px) calc(-84.09% - 2.68px)",
  },
  "lower-leg": {
    inset:
      "calc(-246.09% - 5.92px) calc(-117.19% - 3.34px) calc(-23.44% - 1.47px) calc(-50% - 2px)",
  },
};
