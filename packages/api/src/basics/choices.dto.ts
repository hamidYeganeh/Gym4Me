import type { ChoiceGroup } from "../types";

/** Public choice groups (`/basics/choices`). `value` is the group key. */
export type PublicChoiceGroup = Omit<ChoiceGroup, "isActive">;
