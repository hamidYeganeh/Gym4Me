export type BodyTypeGender = "male" | "female";

export type BodyTypeKind = "endomorph" | "ectomorph" | "mesomorph";

export const BODY_TYPE_KINDS: readonly BodyTypeKind[] = [
  "endomorph",
  "ectomorph",
  "mesomorph",
] as const;
