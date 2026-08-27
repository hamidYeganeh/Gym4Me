import type {
  CreateFavouriteLocationInput,
  FavouriteLocation,
  FavouriteLocationKind,
  UpdateFavouriteLocationInput,
} from "@repo/api";
import {
  composeAddressLine,
  emptyAddressValues,
  type ProfileAddressFormValues,
} from "./profile-settings";

export const FAVOURITE_LOCATION_KINDS = [
  "home",
  "work",
  "gym",
  "other",
] as const satisfies readonly FavouriteLocationKind[];

export const MAX_FAVOURITE_LOCATIONS = 10;

export type FavouriteLocationFormValues = {
  kind: FavouriteLocationKind;
  label: string;
  address: ProfileAddressFormValues;
  cityId: string | null;
  districtId: string | null;
};

export type FavouriteLocationFormError = "label" | "content";

export const emptyFavouriteLocationFormValues =
  (): FavouriteLocationFormValues => ({
    kind: "home",
    label: "",
    address: emptyAddressValues(),
    cityId: null,
    districtId: null,
  });

export function formValuesFromFavouriteLocation(
  item: FavouriteLocation,
): FavouriteLocationFormValues {
  return {
    kind: item.kind,
    label: item.label ?? "",
    address: {
      provinceId: item.address.provinceId,
      street: item.address.street ?? "",
      apartment: "",
      city: item.address.city ?? "",
      district: item.address.district ?? "",
      postalCode: "",
      mapPoint: item.address.point,
    },
    cityId: null,
    districtId: null,
  };
}

export function favouriteLocationLine(
  item: FavouriteLocation,
  provinceName?: string,
): string {
  return composeAddressLine({
    street: item.address.street,
    city: item.address.city,
    district: item.address.district,
    provinceName,
  });
}

export function favouriteLocationHasContent(
  address: ProfileAddressFormValues,
): boolean {
  return Boolean(
    address.city.trim() ||
      address.district.trim() ||
      address.street.trim() ||
      address.mapPoint,
  );
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function addressInput(address: ProfileAddressFormValues) {
  return {
    provinceId: address.provinceId ?? null,
    city: optionalText(address.city),
    district: optionalText(address.district),
    street: optionalText(address.street),
    point: address.mapPoint ?? null,
  };
}

export function buildFavouriteLocationInput(
  values: FavouriteLocationFormValues,
):
  | { ok: true; input: CreateFavouriteLocationInput }
  | { ok: false; error: FavouriteLocationFormError } {
  if (values.kind === "other" && !values.label.trim()) {
    return { ok: false, error: "label" };
  }
  if (!favouriteLocationHasContent(values.address)) {
    return { ok: false, error: "content" };
  }

  const input: CreateFavouriteLocationInput = {
    kind: values.kind,
    address: addressInput(values.address),
  };
  const label = optionalText(values.label);
  if (label) input.label = label;
  return { ok: true, input };
}

export function buildFavouriteLocationUpdateInput(
  values: FavouriteLocationFormValues,
):
  | { ok: true; input: UpdateFavouriteLocationInput }
  | { ok: false; error: FavouriteLocationFormError } {
  const built = buildFavouriteLocationInput(values);
  if (!built.ok) return built;
  return {
    ok: true,
    input: {
      ...built.input,
      label: values.label.trim() ? values.label.trim() : null,
    },
  };
}
