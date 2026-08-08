import type { LocationKind, RefType, SportKind } from "@repo/api";

export const LOCATION_KINDS: LocationKind[] = [
  "country",
  "province",
  "city",
  "district",
];

export const LOCATION_PARENT_KIND: Record<LocationKind, LocationKind | null> = {
  country: null,
  province: "country",
  city: "province",
  district: "city",
};

export const SPORT_KINDS: SportKind[] = ["category", "sport", "branch"];

export const SPORT_PARENT_KIND: Record<SportKind, SportKind | null> = {
  category: null,
  sport: "category",
  branch: "sport",
};

export const REF_TYPES: RefType[] = [
  "equipment",
  "amenity",
  "muscle",
  "goal_type",
  "coach_specialty",
  "cancellation_reason",
  "document_type",
  "measurement_unit",
  "club_category",
  "review_criterion",
];

export function isLocationKind(value: string): value is LocationKind {
  return (LOCATION_KINDS as string[]).includes(value);
}

export function isSportKind(value: string): value is SportKind {
  return (SPORT_KINDS as string[]).includes(value);
}

export function isRefType(value: string): value is RefType {
  return (REF_TYPES as string[]).includes(value);
}
