import { CoachType } from '../../common/enums';

export const COACH_TYPE_VALUES = Object.values(CoachType);

const COACH_TYPE_SET = new Set<string>(COACH_TYPE_VALUES);

export function isCoachType(value: string): value is CoachType {
  return COACH_TYPE_SET.has(value);
}

/** Drop unknowns and keep first-seen order. */
export function uniqueCoachTypes(
  values: readonly string[] | null | undefined,
): CoachType[] {
  const seen = new Set<CoachType>();
  const result: CoachType[] = [];
  for (const value of values ?? []) {
    if (!isCoachType(value) || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}
