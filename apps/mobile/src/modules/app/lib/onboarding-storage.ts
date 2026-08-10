const ONBOARDING_DONE_KEY = "gym4me.onboarding.profileDone";

export type OnboardingDraft = {
  fullName: string;
  goals: string[];
  birthdateIso: string | null;
};

/** Whether the profile onboarding wizard has been finished or skipped. */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_DONE_KEY) === "1";
}

/** Persist that the user finished (or skipped) profile onboarding. */
export function markOnboardingDone(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_DONE_KEY, "1");
}
