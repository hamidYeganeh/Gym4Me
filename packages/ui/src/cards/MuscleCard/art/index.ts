export { AbsMuscleSvg } from "./abs";
export { LowerLegMuscleSvg } from "./lower-leg";
export type { MuscleArtArea } from "./types";

import { AbsMuscleSvg } from "./abs";
import { LowerLegMuscleSvg } from "./lower-leg";
import type { MuscleArtArea } from "./types";

export const muscleArtByArea: Record<MuscleArtArea, string> = {
  abs: AbsMuscleSvg,
  "lower-leg": LowerLegMuscleSvg,
};
