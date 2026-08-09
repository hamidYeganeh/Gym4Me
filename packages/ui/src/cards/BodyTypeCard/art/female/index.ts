export { EctomorphFemaleBodyTypeSvg } from "./ectomorph";
export { EndomorphFemaleBodyTypeSvg } from "./endomorph";
export { MesomorphFemaleBodyTypeSvg } from "./mesomorph";

import type { BodyTypeKind } from "../types";
import { EctomorphFemaleBodyTypeSvg } from "./ectomorph";
import { EndomorphFemaleBodyTypeSvg } from "./endomorph";
import { MesomorphFemaleBodyTypeSvg } from "./mesomorph";

export const femaleBodyTypeArtByKind: Record<BodyTypeKind, string> = {
  "ectomorph": EctomorphFemaleBodyTypeSvg,
  "endomorph": EndomorphFemaleBodyTypeSvg,
  "mesomorph": MesomorphFemaleBodyTypeSvg,
};
