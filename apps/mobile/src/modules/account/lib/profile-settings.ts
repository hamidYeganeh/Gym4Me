import type {
  UpdateAddressInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateMeInput,
  PublicUser,
} from "@repo/api";
import { isoToJalaliDisplay, jalaliDisplayToIso } from "@/shared/lib/jalali";

export const PROFILE_GENDERS = ["female", "male", "other"] as const;

export const USER_CODE_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/;

export type ProfileGenderId = (typeof PROFILE_GENDERS)[number];

export type ProfileProvinceOption = {
  id: string;
  name: string;
};

export type ProfileMapPoint = {
  lat: number;
  lng: number;
};

export type ProfileJalaliDate = {
  year: number;
  month: number;
  day: number;
};

export type ProfileAddressFormValues = {
  provinceId: string | null;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  mapPoint: ProfileMapPoint | null;
};

export type ProfileAthleteFormValues = {
  bio: string;
  levelKey: string;
  heightCm: string;
  weightKg: string;
};

export type ProfileCoachFormValues = {
  bio: string;
  headline: string;
  years: string;
};

export type ProfileSettingsFormValues = {
  name: { first: string; last: string };
  code: string;
  gender: ProfileGenderId | "";
  birthDateJalali: string;
  address: ProfileAddressFormValues;
  athlete: ProfileAthleteFormValues | null;
  coach: ProfileCoachFormValues | null;
};

export type ProfileSettingsSaveError =
  | "birthDate"
  | "postalCode"
  | "code"
  | "height"
  | "weight"
  | "years";

export const emptyAddressValues = (): ProfileAddressFormValues => ({
  provinceId: null,
  street: "",
  apartment: "",
  city: "",
  postalCode: "",
  mapPoint: null,
});

export const emptyAthleteValues = (): ProfileAthleteFormValues => ({
  bio: "",
  levelKey: "",
  heightCm: "",
  weightKg: "",
});

export const emptyCoachValues = (): ProfileCoachFormValues => ({
  bio: "",
  headline: "",
  years: "",
});

export const emptyProfileSettingsValues = (): ProfileSettingsFormValues => ({
  name: { first: "", last: "" },
  code: "",
  gender: "",
  birthDateJalali: "",
  address: emptyAddressValues(),
  athlete: null,
  coach: null,
});

export function isProfileGenderId(value: string): value is ProfileGenderId {
  return PROFILE_GENDERS.includes(value as ProfileGenderId);
}

export function joinFullName(
  first?: string | null,
  last?: string | null,
): string {
  return [first, last].filter(Boolean).join(" ");
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

export function jalaliDisplayToCalendarValue(
  value: string,
): ProfileJalaliDate | null {
  const match = /^(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(
    normalizeDigits(value).trim(),
  );
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function calendarValueToJalaliDisplay(value: ProfileJalaliDate): string {
  return `${value.year}/${String(value.month).padStart(2, "0")}/${String(value.day).padStart(2, "0")}`;
}

export function normalizeUserCode(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUserCode(value: string): boolean {
  const code = normalizeUserCode(value);
  return code.length === 0 || USER_CODE_PATTERN.test(code);
}

export function formValuesFromUser(
  user: PublicUser,
): Omit<ProfileSettingsFormValues, "athlete" | "coach"> {
  return {
    name: {
      first: user.name.first ?? "",
      last: user.name.last ?? "",
    },
    code: user.code ?? "",
    gender: genderFromUser(user.demographics.gender),
    birthDateJalali: isoToJalaliDisplay(user.demographics.birthDate),
    address: {
      provinceId: user.address.provinceId,
      street: user.address.street ?? "",
      apartment: user.address.apartment ?? "",
      city: user.address.city ?? "",
      postalCode: user.address.postalCode ?? "",
      mapPoint: user.address.point
        ? { lat: user.address.point.lat, lng: user.address.point.lng }
        : null,
    },
  };
}

export function buildUpdateMeInput(
  values: ProfileSettingsFormValues,
):
  | { ok: true; input: UpdateMeInput }
  | { ok: false; error: ProfileSettingsSaveError } {
  const birthRaw = normalizeDigits(values.birthDateJalali).trim();
  let birthDate: string | undefined;
  if (birthRaw) {
    const iso = jalaliDisplayToIso(birthRaw.replace(/\s/g, ""));
    if (!iso) return { ok: false, error: "birthDate" };
    birthDate = iso;
  }

  const postal = normalizeDigits(values.address.postalCode).replace(/\D/g, "");
  if (postal && !/^\d{10}$/.test(postal)) {
    return { ok: false, error: "postalCode" };
  }

  const code = normalizeUserCode(values.code);
  if (code && !USER_CODE_PATTERN.test(code)) {
    return { ok: false, error: "code" };
  }

  const address: UpdateAddressInput = {};
  if (values.address.provinceId) {
    address.provinceId = values.address.provinceId;
  }
  if (values.address.city.trim()) address.city = values.address.city.trim();
  if (values.address.street.trim()) {
    address.street = values.address.street.trim();
  }
  if (values.address.apartment.trim()) {
    address.apartment = values.address.apartment.trim();
  }
  if (postal) address.postalCode = postal;
  if (values.address.mapPoint) {
    address.point = {
      lat: values.address.mapPoint.lat,
      lng: values.address.mapPoint.lng,
    };
  }

  const input: UpdateMeInput = {
    name: {
      first: values.name.first.trim(),
      last: values.name.last.trim(),
    },
  };
  if (code) input.code = code;
  if (values.gender || birthDate) {
    input.demographics = {
      gender: values.gender || undefined,
      birthDate,
    };
  }
  if (Object.keys(address).length > 0) input.address = address;
  return { ok: true, input };
}

export function buildUpdateAthleteInput(
  values: ProfileAthleteFormValues,
):
  | { ok: true; input: UpdateAthleteProfileInput }
  | { ok: false; error: ProfileSettingsSaveError } {
  const heightRaw = normalizeDigits(values.heightCm).trim();
  const weightRaw = normalizeDigits(values.weightKg).trim();
  const heightCm = heightRaw ? Number(heightRaw) : undefined;
  const weightKg = weightRaw ? Number(weightRaw) : undefined;
  if (
    heightCm != null &&
    (!Number.isFinite(heightCm) || heightCm < 50 || heightCm > 250)
  ) {
    return { ok: false, error: "height" };
  }
  if (
    weightKg != null &&
    (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400)
  ) {
    return { ok: false, error: "weight" };
  }
  return {
    ok: true,
    input: {
      bio: values.bio.trim() || undefined,
      levelKey: values.levelKey.trim() || undefined,
      body: {
        heightCm,
        weightKg,
      },
    },
  };
}

export function buildUpdateCoachInput(
  values: ProfileCoachFormValues,
):
  | { ok: true; input: UpdateCoachProfileInput }
  | { ok: false; error: ProfileSettingsSaveError } {
  const yearsRaw = normalizeDigits(values.years).trim();
  const years = yearsRaw ? Number(yearsRaw) : undefined;
  if (years != null && (!Number.isFinite(years) || years < 0 || years > 60)) {
    return { ok: false, error: "years" };
  }
  return {
    ok: true,
    input: {
      bio: values.bio.trim() || undefined,
      experience: {
        headline: values.headline.trim() || undefined,
        years,
      },
    },
  };
}
