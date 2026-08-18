import type { PublicUser, UpdateAddressInput, UpdateMeInput } from "@repo/api";
import { isoToJalaliDisplay, jalaliDisplayToIso } from "@/shared/lib/jalali";

export const PROFILE_GENDERS = ["female", "male", "other"] as const;

export type ProfileGenderId = (typeof PROFILE_GENDERS)[number];

export type ProfileProvinceOption = {
  id: string;
  name: string;
};

export type ProfileMapPoint = {
  lat: number;
  lng: number;
};

export type ProfileSettingsFormValues = {
  fullName: string;
  provinceId: string | null;
  gender: ProfileGenderId | "";
  birthDateJalali: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  mapPoint: ProfileMapPoint | null;
};

export type ProfileSettingsSaveError = "birthDate" | "postalCode";

export function isProfileGenderId(value: string): value is ProfileGenderId {
  return PROFILE_GENDERS.includes(value as ProfileGenderId);
}

export function joinFullName(
  first?: string | null,
  last?: string | null,
): string {
  return [first, last].filter(Boolean).join(" ");
}

export function splitFullName(fullName: string): {
  first?: string;
  last?: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) return { first: "", last: "" };
  const [first = "", ...rest] = trimmed.split(/\s+/);
  return { first, last: rest.join(" ") };
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function formatIranPhoneDisplay(phone: string): string {
  const digits = normalizeDigits(phone).replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    const local = `0${digits.slice(2)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function composeAddressLine(parts: {
  street?: string | null;
  apartment?: string | null;
  city?: string | null;
  provinceName?: string | null;
  postalCode?: string | null;
}): string {
  return [
    parts.street,
    parts.apartment,
    parts.city,
    parts.provinceName,
    parts.postalCode,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("، ");
}

export function genderFromUser(
  value: string | null | undefined,
): ProfileGenderId | "" {
  if (value && isProfileGenderId(value)) return value;
  return "";
}

export function formValuesFromUser(
  user: PublicUser,
): ProfileSettingsFormValues {
  return {
    fullName: joinFullName(user.name.first, user.name.last),
    provinceId: user.address.provinceId,
    gender: genderFromUser(user.demographics.gender),
    birthDateJalali: isoToJalaliDisplay(user.demographics.birthDate),
    street: user.address.street ?? "",
    apartment: user.address.apartment ?? "",
    city: user.address.city ?? "",
    postalCode: user.address.postalCode ?? "",
    mapPoint: user.address.point
      ? { lat: user.address.point.lat, lng: user.address.point.lng }
      : null,
  };
}

export function buildUpdateMeInput(
  values: ProfileSettingsFormValues,
): { ok: true; input: UpdateMeInput } | { ok: false; error: ProfileSettingsSaveError } {
  const birthRaw = normalizeDigits(values.birthDateJalali).trim();
  let birthDate: string | undefined;
  if (birthRaw) {
    const iso = jalaliDisplayToIso(birthRaw.replace(/\s/g, ""));
    if (!iso) return { ok: false, error: "birthDate" };
    birthDate = iso;
  }

  const postal = normalizeDigits(values.postalCode).replace(/\D/g, "");
  if (postal && !/^\d{10}$/.test(postal)) {
    return { ok: false, error: "postalCode" };
  }

  const address: UpdateAddressInput = {};
  if (values.provinceId) address.provinceId = values.provinceId;
  if (values.city.trim()) address.city = values.city.trim();
  if (values.street.trim()) address.street = values.street.trim();
  if (values.apartment.trim()) address.apartment = values.apartment.trim();
  if (postal) address.postalCode = postal;
  if (values.mapPoint) {
    address.point = {
      lat: values.mapPoint.lat,
      lng: values.mapPoint.lng,
    };
  }

  const input: UpdateMeInput = {
    name: splitFullName(values.fullName),
  };
  if (values.gender || birthDate) {
    input.demographics = {
      gender: values.gender || undefined,
      birthDate,
    };
  }
  if (Object.keys(address).length > 0) input.address = address;
  return { ok: true, input };
}
