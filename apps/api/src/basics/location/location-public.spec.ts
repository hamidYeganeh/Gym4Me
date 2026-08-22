import { Types } from 'mongoose';
import { LocationKind } from '../../common/enums';
import {
  collectLocationRelatedIds,
  toLocationPublic,
  toLocationRef,
  type LocationLike,
} from './location-public';

function loc(
  id: Types.ObjectId,
  overrides: Partial<LocationLike> = {},
): LocationLike {
  return {
    _id: id,
    kind: LocationKind.CITY,
    name: 'تهران',
    slug: 'tehran',
    order: 0,
    isActive: true,
    ...overrides,
  };
}

describe('location-public', () => {
  const countryId = new Types.ObjectId();
  const provinceId = new Types.ObjectId();
  const cityId = new Types.ObjectId();

  const country = loc(countryId, {
    kind: LocationKind.COUNTRY,
    name: 'ایران',
    slug: 'iran',
  });
  const province = loc(provinceId, {
    kind: LocationKind.PROVINCE,
    name: 'تهران',
    slug: 'tehran-province',
    parentId: countryId,
    ancestors: [countryId],
  });
  const city = loc(cityId, {
    kind: LocationKind.CITY,
    name: 'تهران',
    slug: 'tehran',
    parentId: provinceId,
    ancestors: [countryId, provinceId],
    center: { coordinates: [51.4, 35.7] },
  });

  it('collects parent and ancestor ids once', () => {
    const ids = collectLocationRelatedIds([city, province]);
    expect(ids.map((id) => id.toString()).sort()).toEqual(
      [countryId.toString(), provinceId.toString()].sort(),
    );
  });

  it('maps a city with populated parent and ancestors', () => {
    const related = new Map<string, LocationLike>([
      [countryId.toString(), country],
      [provinceId.toString(), province],
    ]);

    expect(toLocationPublic(city, related)).toEqual({
      ...toLocationRef(city),
      parent: toLocationRef(province),
      ancestors: [toLocationRef(country), toLocationRef(province)],
    });
  });

  it('falls back to id when an ancestor is missing', () => {
    const related = new Map<string, LocationLike>([
      [provinceId.toString(), province],
    ]);

    expect(toLocationPublic(city, related).ancestors).toEqual([
      { id: countryId.toString() },
      toLocationRef(province),
    ]);
  });
});
