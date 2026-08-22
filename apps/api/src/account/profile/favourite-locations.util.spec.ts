import { Types } from 'mongoose';
import { FavouriteLocationKind } from '../../common/enums';
import {
  applyAddressPatch,
  favouriteLocationHasContent,
  findExclusiveKindConflict,
  geoPointToLatLng,
  isExclusiveFavouriteLocationKind,
  latLngToGeoPoint,
  toPublicAddress,
  toPublicFavouriteLocation,
} from './favourite-locations.util';

describe('favourite-locations.util', () => {
  it('maps GeoJSON [lng, lat] to lat/lng and back', () => {
    const point = latLngToGeoPoint({ lat: 35.7, lng: 51.4 });
    expect(point).toEqual({ type: 'Point', coordinates: [51.4, 35.7] });
    expect(geoPointToLatLng(point)).toEqual({ lat: 35.7, lng: 51.4 });
    expect(geoPointToLatLng(undefined)).toBeNull();
  });

  it('requires street, city, apartment or a map point', () => {
    expect(
      favouriteLocationHasContent({
        provinceId: null,
        city: null,
        street: null,
        apartment: null,
        postalCode: null,
        point: null,
      }),
    ).toBe(false);
    expect(
      favouriteLocationHasContent({
        provinceId: null,
        city: 'تهران',
        street: null,
        apartment: null,
        postalCode: null,
        point: null,
      }),
    ).toBe(true);
    expect(
      favouriteLocationHasContent({
        provinceId: null,
        city: null,
        street: null,
        apartment: null,
        postalCode: null,
        point: { lat: 35.7, lng: 51.4 },
      }),
    ).toBe(true);
  });

  it('treats home/work/gym as exclusive and other as repeatable', () => {
    expect(isExclusiveFavouriteLocationKind(FavouriteLocationKind.HOME)).toBe(
      true,
    );
    expect(isExclusiveFavouriteLocationKind(FavouriteLocationKind.OTHER)).toBe(
      false,
    );

    const homeId = new Types.ObjectId();
    const items = [
      { _id: homeId, kind: FavouriteLocationKind.HOME },
      { _id: new Types.ObjectId(), kind: FavouriteLocationKind.OTHER },
    ];
    expect(
      findExclusiveKindConflict(items, FavouriteLocationKind.HOME),
    ).toBe(true);
    expect(
      findExclusiveKindConflict(
        items,
        FavouriteLocationKind.HOME,
        homeId.toString(),
      ),
    ).toBe(false);
    expect(
      findExclusiveKindConflict(items, FavouriteLocationKind.WORK),
    ).toBe(false);
    expect(
      findExclusiveKindConflict(items, FavouriteLocationKind.OTHER),
    ).toBe(false);
  });

  it('patches nested address and maps a public favourite location', () => {
    const patched = applyAddressPatch(
      { city: 'قدیمی', street: 'ولیعصر' },
      { city: 'تهران', point: { lat: 35.7, lng: 51.4 } },
    );
    expect(patched.city).toBe('تهران');
    expect(patched.street).toBe('ولیعصر');
    expect(patched.point).toEqual({
      type: 'Point',
      coordinates: [51.4, 35.7],
    });

    const id = new Types.ObjectId();
    expect(
      toPublicFavouriteLocation({
        _id: id,
        kind: FavouriteLocationKind.HOME,
        label: '  خانه  ',
        address: patched,
      }),
    ).toEqual({
      id: id.toString(),
      kind: FavouriteLocationKind.HOME,
      label: 'خانه',
      address: toPublicAddress(patched),
    });
  });
});
