export type { BodyTypeGender, BodyTypeKind } from "./types";
export { BODY_TYPE_KINDS } from "./types";
export { maleBodyTypeArtByKind } from "./male";
export { femaleBodyTypeArtByKind } from "./female";

import { femaleBodyTypeArtByKind } from "./female";
import { maleBodyTypeArtByKind } from "./male";
import type { BodyTypeGender, BodyTypeKind } from "./types";

/** Built-in body-type art by gender. */
export const bodyTypeArtByGender: Record<
  BodyTypeGender,
  Record<BodyTypeKind, string>
> = {
  male: maleBodyTypeArtByKind,
  female: femaleBodyTypeArtByKind,
};

export function getBodyTypeArt(
  bodyType: BodyTypeKind,
  gender: BodyTypeGender = "male",
): string {
  return bodyTypeArtByGender[gender][bodyType];
}
