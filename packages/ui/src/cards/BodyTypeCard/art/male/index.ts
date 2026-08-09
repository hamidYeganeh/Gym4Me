export { EctomorphMaleBodyTypeSvg } from "./ectomorph";
export { EndomorphMaleBodyTypeSvg } from "./endomorph";
export { MesomorphMaleBodyTypeSvg } from "./mesomorph";

import type { BodyTypeKind } from "../types";
import { EctomorphMaleBodyTypeSvg } from "./ectomorph";
import { EndomorphMaleBodyTypeSvg } from "./endomorph";
import { MesomorphMaleBodyTypeSvg } from "./mesomorph";

export const maleBodyTypeArtByKind: Record<BodyTypeKind, string> = {
  "ectomorph": EctomorphMaleBodyTypeSvg,
  "endomorph": EndomorphMaleBodyTypeSvg,
  "mesomorph": MesomorphMaleBodyTypeSvg,
};
