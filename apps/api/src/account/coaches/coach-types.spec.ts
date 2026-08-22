import { CoachType } from '../../common/enums';
import {
  COACH_TYPE_VALUES,
  isCoachType,
  uniqueCoachTypes,
} from './coach-types';

describe('coach types', () => {
  it('lists each coach type once in a stable catalog', () => {
    expect(COACH_TYPE_VALUES).toHaveLength(29);
    expect(new Set(COACH_TYPE_VALUES).size).toBe(COACH_TYPE_VALUES.length);
    expect(COACH_TYPE_VALUES).toEqual(
      expect.arrayContaining([
        CoachType.BODYBUILDING,
        CoachType.YOGA,
        CoachType.WOMENS_FITNESS,
        CoachType.SPORTS_NUTRITION,
      ]),
    );
  });

  it('keeps first-seen valid types and drops the rest', () => {
    expect(isCoachType('yoga')).toBe(true);
    expect(isCoachType('hiit')).toBe(false);
    expect(
      uniqueCoachTypes([
        'yoga',
        'yoga',
        'hiit',
        CoachType.CROSSFIT,
        'strength-training',
      ]),
    ).toEqual([
      CoachType.YOGA,
      CoachType.CROSSFIT,
      CoachType.STRENGTH_TRAINING,
    ]);
  });
});
