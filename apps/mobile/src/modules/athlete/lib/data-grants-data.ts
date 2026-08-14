import type { AthleteDataGrantScope } from "@repo/api";

export type CoachRelationshipOption = {
  relationshipId: string;
  coachUserId: string;
  label: string;
};

export const DATA_GRANT_SCOPE_OPTIONS: {
  key: AthleteDataGrantScope;
  label: string;
}[] = [
  { key: "metrics.weight", label: "وزن" },
  { key: "metrics.sleep", label: "خواب" },
  { key: "metrics.steps", label: "قدم" },
  { key: "metrics.water", label: "آب" },
  { key: "metrics.walking", label: "پیاده‌روی" },
  { key: "metrics.*", label: "همهٔ متریک‌ها" },
  { key: "workouts.logs", label: "لاگ تمرین" },
  { key: "progress.photos", label: "عکس پیشرفت" },
  { key: "progress.personal_records", label: "رکورد شخصی" },
];

export function labelForScope(scope: AthleteDataGrantScope) {
  return (
    DATA_GRANT_SCOPE_OPTIONS.find((item) => item.key === scope)?.label ?? scope
  );
}
