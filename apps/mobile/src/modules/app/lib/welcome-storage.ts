import { FLAG_KEYS, readFlag, writeFlag } from "@/shared/lib/flag-storage";

/** Whether the first-launch welcome screen has been completed. */
export function hasSeenWelcome(): boolean {
  return readFlag(FLAG_KEYS.welcomeSeen) === "1";
}

/** Persist that the user finished (or skipped) the welcome screen. */
export function markWelcomeSeen(): void {
  writeFlag(FLAG_KEYS.welcomeSeen, "1");
}
