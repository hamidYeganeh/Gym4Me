import { Types } from 'mongoose';
import { FavouriteLocationKind } from '../../common/enums';
import type { GeoPoint } from '../../schemas/location.schema';
import type { UserAddress } from '../../schemas/user.schema';
import type { UserFavouriteLocation } from '../../schemas/user.schema';

export const MAX_FAVOURITE_LOCATIONS = 10;

export const EXCLUSIVE_FAVOURITE_LOCATION_KINDS = [
  FavouriteLocationKind.HOME,
  FavouriteLocationKind.WORK,
  FavouriteLocationKind.GYM,
] as const;

export type ExclusiveFavouriteLocationKind =
  (typeof EXCLUSIVE_FAVOURITE_LOCATION_KINDS)[number];

export type FavouriteLocationAddressPublic = {
  provinceId: string | null;
  city: string | null;
  street: string | null;
  apartment: string | null;
  postalCode: string | null;
  point: { lat: number; lng: number } | null;
};

export type FavouriteLocationPublic = {
  id: string;
  kind: FavouriteLocationKind;
  label: string | null;
  address: FavouriteLocationAddressPublic;
};

export type FavouriteLocationAddressPatch = {
  provinceId?: string | null;
  city?: string;
  street?: string;
  apartment?: string;
  postalCode?: string;
  point?: { lat: number; lng: number } | null;
};

export function isExclusiveFavouriteLocationKind(
  kind: FavouriteLocationKind,
): kind is ExclusiveFavouriteLocationKind {
  return (EXCLUSIVE_FAVOURITE_LOCATION_KINDS as readonly string[]).includes(
    kind,
  );
}

export function geoPointToLatLng(
  point?: GeoPoint | null,
): { lat: number; lng: number } | null {
  if (!point?.coordinates || point.coordinates.length < 2) return null;
  return { lat: point.coordinates[1], lng: point.coordinates[0] };
}

export function latLngToGeoPoint(point: {
  lat: number;
  lng: number;
}): GeoPoint {
  return { type: 'Point', coordinates: [point.lng, point.lat] };
}

export function toPublicAddress(
  address?: UserAddress | null,
): FavouriteLocationAddressPublic {
  return {
    provinceId: address?.provinceId?.toString() ?? null,
    city: address?.city ?? null,
    street: address?.street ?? null,
    apartment: address?.apartment ?? null,
    postalCode: address?.postalCode ?? null,
    point: geoPointToLatLng(address?.point),
  };
}

export function toPublicFavouriteLocation(
  item: UserFavouriteLocation & { _id: Types.ObjectId },
): FavouriteLocationPublic {
  return {
    id: item._id.toString(),
    kind: item.kind,
    label: item.label?.trim() ? item.label.trim() : null,
    address: toPublicAddress(item.address),
  };
}

export function applyAddressPatch(
  current: UserAddress | undefined,
  patch: FavouriteLocationAddressPatch,
): UserAddress {
  const next: UserAddress = {
    provinceId: current?.provinceId,
    city: current?.city,
    street: current?.street,
    apartment: current?.apartment,
    postalCode: current?.postalCode,
    point: current?.point,
  };

  if (patch.provinceId !== undefined) {
    next.provinceId = patch.provinceId
      ? new Types.ObjectId(patch.provinceId)
      : undefined;
  }
  if (patch.city !== undefined) next.city = patch.city;
  if (patch.street !== undefined) next.street = patch.street;
  if (patch.apartment !== undefined) next.apartment = patch.apartment;
  if (patch.postalCode !== undefined) next.postalCode = patch.postalCode;
  if (patch.point !== undefined) {
    next.point = patch.point ? latLngToGeoPoint(patch.point) : undefined;
  }
  return next;
}

export function favouriteLocationHasContent(
  address: FavouriteLocationAddressPublic,
): boolean {
  return Boolean(
    address.city?.trim() ||
      address.street?.trim() ||
      address.apartment?.trim() ||
      address.point,
  );
}

export function findExclusiveKindConflict(
  items: Array<{ _id: Types.ObjectId; kind: FavouriteLocationKind }>,
  kind: FavouriteLocationKind,
  ignoreId?: string,
): boolean {
  if (!isExclusiveFavouriteLocationKind(kind)) return false;
  return items.some(
    (item) =>
      item.kind === kind && (!ignoreId || item._id.toString() !== ignoreId),
  );
}
