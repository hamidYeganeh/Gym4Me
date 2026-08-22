import { Types } from 'mongoose';
import { SportKind } from '../../common/enums';
import {
  collectSportRelatedIds,
  toSportPublic,
  toSportRef,
  type SportLike,
} from './sport-public';

function sport(
  id: Types.ObjectId,
  overrides: Partial<SportLike> = {},
): SportLike {
  return {
    _id: id,
    kind: SportKind.SPORT,
    name: 'فوتبال',
    slug: 'football',
    order: 0,
    isActive: true,
    ...overrides,
  };
}

describe('sport-public', () => {
  const categoryId = new Types.ObjectId();
  const sportId = new Types.ObjectId();

  const category = sport(categoryId, {
    kind: SportKind.CATEGORY,
    name: 'ورزش‌های توپی',
    slug: 'ball-sports',
  });
  const football = sport(sportId, {
    parentId: categoryId,
    ancestors: [categoryId],
  });

  it('collects parent and ancestor ids', () => {
    expect(
      collectSportRelatedIds([football]).map((id) => id.toString()),
    ).toEqual([categoryId.toString()]);
  });

  it('maps a sport with populated parent and ancestors', () => {
    const related = new Map<string, SportLike>([
      [categoryId.toString(), category],
    ]);

    expect(toSportPublic(football, related)).toEqual({
      ...toSportRef(football),
      parent: toSportRef(category),
      ancestors: [toSportRef(category)],
    });
  });
});
