export type MuscleGender = "male" | "female";

export type MuscleArtArea =
  | "abs"
  | "back"
  | "bicep"
  | "calf"
  | "chest"
  | "forearm"
  | "glute"
  | "hamstring"
  | "hand"
  | "lower-leg"
  | "neck"
  | "shoulder"
  | "trap"
  | "tricep"
  | "upper-leg";

export const MUSCLE_ART_AREAS: readonly MuscleArtArea[] = [
  "abs",
  "back",
  "bicep",
  "calf",
  "chest",
  "forearm",
  "glute",
  "hamstring",
  "hand",
  "lower-leg",
  "neck",
  "shoulder",
  "trap",
  "tricep",
  "upper-leg",
] as const;
