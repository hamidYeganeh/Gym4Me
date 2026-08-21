import {
  hydrateOnboardingProfileFlag,
  onboardingProfileDoneKey,
  readFlag,
  writeFlag,
} from "@/shared/lib/flag-storage";

export type OnboardingDraft = {
  fullName: string;
  goals: string[];
  birthdateIso: string | null;
};

export { hydrateOnboardingProfileFlag };

/** Whether this account finished or skipped the profile onboarding wizard. */
export function hasCompletedOnboarding(userId: string): boolean {
  if (!userId) return false;
  return readFlag(onboardingProfileDoneKey(userId)) === "1";
}

/** Persist that this account finished (or skipped) profile onboarding. */
export function markOnboardingDone(userId: string): void {
  if (!userId) return;
  writeFlag(onboardingProfileDoneKey(userId), "1");
}
