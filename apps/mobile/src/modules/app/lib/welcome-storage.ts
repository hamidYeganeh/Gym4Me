const WELCOME_SEEN_KEY = "gym4me.onboarding.welcomeSeen";

/** Whether the first-launch welcome screen has been completed. */
export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(WELCOME_SEEN_KEY) === "1";
}

/** Persist that the user finished (or skipped) the welcome screen. */
export function markWelcomeSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
}
