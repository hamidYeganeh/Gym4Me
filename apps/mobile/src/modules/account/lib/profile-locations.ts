import type {
  CreateFavouriteLocationInput,
  FavouriteLocation,
  FavouriteLocationKind,
  UpdateFavouriteLocationInput,
} from "@repo/api";
import {
  composeAddressLine,
  emptyAddressValues,
  normalizeDigits,
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
};

export type FavouriteLocationFormError =
  | "label"
  | "postalCode"
  | "content";

export const emptyFavouriteLocationFormValues =
  (): FavouriteLocationFormValues => ({
    kind: "home",
    label: "",
    address: emptyAddressValues(),
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
      apartment: item.address.apartment ?? "",
      city: item.address.city ?? "",
      postalCode: item.address.postalCode ?? "",
      mapPoint: item.address.point,
    },
  };
}

export function favouriteLocationLine(
  item: FavouriteLocation,
  provinceName?: string,
): string {
  return composeAddressLine({
    street: item.address.street,
    apartment: item.address.apartment,
    city: item.address.city,
    provinceName,
    postalCode: item.address.postalCode,
  });
}

export function favouriteLocationHasContent(
  address: ProfileAddressFormValues,
): boolean {
  return Boolean(
    address.city.trim() ||
      address.street.trim() ||
      address.apartment.trim() ||
      address.mapPoint,
  );
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function addressInput(address: ProfileAddressFormValues) {
  const postal = normalizeDigits(address.postalCode).replace(/\D/g, "");
  return {
    provinceId: address.provinceId,
    city: optionalText(address.city),
    street: optionalText(address.street),
    apartment: optionalText(address.apartment),
    postalCode: postal || undefined,
    point: address.mapPoint,
  };
}

export function buildFavouriteLocationInput(
  values: FavouriteLocationFormValues,
):
  | { ok: true; input: CreateFavouriteLocationInput }
  | { ok: false; error: FavouriteLocationFormError } {
  const postal = normalizeDigits(values.address.postalCode).replace(/\D/g, "");
  if (postal && postal.length !== 10) {
    return { ok: false, error: "postalCode" };
  }
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
