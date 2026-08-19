export type OnboardingStepId =
  | "review"
  | "name"
  | "gender"
  | "birthdate"
  | "height"
  | "weight"
  | "bodyType"
  | "experience"
  | "sleep"
  | "mood"
  | "activities"
  | "diet"
  | "calories"
  | "goals"
  | "bloodType"
  | "personalIntro"
  | "identity"
  | "avatar";

export type OnboardingPhaseId = "assessment" | "personal" | "plan";

export type OnboardingGoalId =
  | "overallHealth"
  | "trackMetrics"
  | "aiAssistant"
  | "sportsActivity"
  | "justTrying";

export type OnboardingGenderId = "male" | "female";

export type OnboardingBodyTypeId = "endomorph" | "ectomorph" | "mesomorph";

export type OnboardingBloodGroup = "A" | "B" | "AB" | "O";

export type OnboardingRhFactor = "positive" | "negative";

/** Prior training background — enum, not a boolean. */
export type OnboardingExperienceId = "experienced" | "beginner";

export type OnboardingSleepLevel = 1 | 2 | 3 | 4 | 5;

export type OnboardingMoodId =
  | "depressed"
  | "sad"
  | "neutral"
  | "happy"
  | "overjoyed";

export type OnboardingDietId =
  | "balanced"
  | "vegetarian"
  | "protein"
  | "glutenFree";

export type OnboardingActivityId =
  | "jogging"
  | "cycling"
  | "hiking"
  | "yoga"
  | "eating"
  | "fitness"
  | "rowing"
  | "skating"
  | "tennis"
  | "soccer"
  | "baseball"
  | "other";

export const ONBOARDING_STEPS: OnboardingStepId[] = [
  "review",
  "name",
  "gender",
  "bodyType",
  "weight",
  "height",
  "birthdate",
  "experience",
  "sleep",
  "mood",
  "activities",
  "diet",
  "calories",
  "goals",
  "bloodType",
  "personalIntro",
  "identity",
  "avatar",
];

export const ONBOARDING_PHASES: OnboardingPhaseId[] = [
  "assessment",
  "personal",
  "plan",
];

export const ONBOARDING_PERSONAL_STEPS: OnboardingStepId[] = [
  "personalIntro",
  "identity",
  "avatar",
];

export function onboardingPhaseForStep(
  step: OnboardingStepId,
): OnboardingPhaseId {
  if (ONBOARDING_PERSONAL_STEPS.includes(step)) return "personal";
  return "assessment";
}

/** Offline fallback when basics locations API is unavailable. */
export const ONBOARDING_FALLBACK_PROVINCES = [
  { id: "tehran", name: "تهران" },
  { id: "isfahan", name: "اصفهان" },
  { id: "fars", name: "فارس" },
  { id: "khorasan-razavi", name: "خراسان رضوی" },
  { id: "azarbaijan-sharqi", name: "آذربایجان شرقی" },
  { id: "khuzestan", name: "خوزستان" },
  { id: "mazandaran", name: "مازندران" },
  { id: "alborz", name: "البرز" },
] as const;

export const ONBOARDING_DEFAULT_ALLERGIES = [
  "گرده",
  "غذا",
  "نیکل",
] as const;

/** Canonical body metrics stored as metric units. */
export const ONBOARDING_DEFAULT_HEIGHT_CM = 162;
export const ONBOARDING_DEFAULT_WEIGHT_KG = 64;
export const ONBOARDING_DEFAULT_SLEEP: OnboardingSleepLevel = 5;
export const ONBOARDING_DEFAULT_MOOD: OnboardingMoodId = "neutral";
export const ONBOARDING_DEFAULT_DIET: OnboardingDietId = "balanced";
export const ONBOARDING_DEFAULT_CALORIES = 0;

export const ONBOARDING_HEIGHT_CM_RANGE = { min: 120, max: 220 } as const;
export const ONBOARDING_HEIGHT_IN_RANGE = { min: 48, max: 86 } as const;
export const ONBOARDING_WEIGHT_KG_RANGE = { min: 30, max: 200 } as const;
export const ONBOARDING_WEIGHT_LBS_RANGE = { min: 66, max: 440 } as const;
export const ONBOARDING_CALORIES_RANGE = { min: 0, max: 6000 } as const;
export const ONBOARDING_CALORIES_STEP = 50;
export const ONBOARDING_CALORIE_PRESETS = [1500, 2000, 2500] as const;

export const ONBOARDING_SLIDE_COUNT = ONBOARDING_STEPS.length;

export const ONBOARDING_GOALS: OnboardingGoalId[] = [
  "overallHealth",
  "trackMetrics",
  "aiAssistant",
  "sportsActivity",
  "justTrying",
];

export const ONBOARDING_GENDERS: OnboardingGenderId[] = ["male", "female"];

export const ONBOARDING_BODY_TYPES: OnboardingBodyTypeId[] = [
  "endomorph",
  "ectomorph",
  "mesomorph",
];

export const ONBOARDING_BLOOD_GROUPS: OnboardingBloodGroup[] = [
  "A",
  "B",
  "AB",
  "O",
];

export const ONBOARDING_SLEEP_LEVELS: OnboardingSleepLevel[] = [1, 2, 3, 4, 5];

export const ONBOARDING_MOODS: OnboardingMoodId[] = [
  "depressed",
  "sad",
  "neutral",
  "happy",
  "overjoyed",
];

export const ONBOARDING_DIETS: OnboardingDietId[] = [
  "balanced",
  "vegetarian",
  "protein",
  "glutenFree",
];

export const ONBOARDING_ACTIVITIES: OnboardingActivityId[] = [
  "jogging",
  "cycling",
  "hiking",
  "yoga",
  "eating",
  "fitness",
  "rowing",
  "skating",
  "tennis",
  "soccer",
  "baseball",
  "other",
];

/** Default Jalali birthdate ≈ 19 years old in typical mockups. */
export const ONBOARDING_DEFAULT_BIRTH = {
  year: 1384,
  month: 6,
  day: 17,
} as const;

export const ONBOARDING_YEAR_MIN = 1330;
export const ONBOARDING_YEAR_MAX = 1405;

export function jalaliDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 30;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

/** Common 33-year cycle leap rule used by Iranian civil calendar. */
export function isJalaliLeapYear(year: number): boolean {
  const breaks = [1, 5, 9, 13, 17, 22, 26, 30];
  return breaks.includes(((year % 33) + 33) % 33);
}

export function clampJalaliDay(
  year: number,
  month: number,
  day: number,
): number {
  const max = jalaliDaysInMonth(year, month);
  return Math.min(Math.max(1, day), max);
}
