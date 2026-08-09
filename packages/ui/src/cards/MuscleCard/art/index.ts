export type { MuscleArtArea, MuscleGender } from "./types";
export { MUSCLE_ART_AREAS } from "./types";
export { maleMuscleArtByArea } from "./male";
export { femaleMuscleArtByArea } from "./female";

import { femaleMuscleArtByArea } from "./female";
import { maleMuscleArtByArea } from "./male";
import type { MuscleArtArea, MuscleGender } from "./types";

/** Built-in anatomy art by gender. */
export const muscleArtByGender: Record<
  MuscleGender,
  Record<MuscleArtArea, string>
> = {
  male: maleMuscleArtByArea,
  female: femaleMuscleArtByArea,
};

export function getMuscleArt(
  bodyArea: MuscleArtArea,
  gender: MuscleGender = "male",
): string {
  return muscleArtByGender[gender][bodyArea];
}

/** @deprecated Prefer `getMuscleArt(area, gender)`. */
export const muscleArtByArea = maleMuscleArtByArea;
