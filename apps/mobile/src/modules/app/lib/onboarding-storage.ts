import { FLAG_KEYS, readFlag, writeFlag } from "@/shared/lib/flag-storage";

export type OnboardingDraft = {
  fullName: string;
  goals: string[];
  birthdateIso: string | null;
};

/** Whether the profile onboarding wizard has been finished or skipped. */
export function hasCompletedOnboarding(): boolean {
  return readFlag(FLAG_KEYS.onboardingProfileDone) === "1";
}

/** Persist that the user finished (or skipped) profile onboarding. */
export function markOnboardingDone(): void {
  writeFlag(FLAG_KEYS.onboardingProfileDone, "1");
}
