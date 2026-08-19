import type { OnboardingBirthdateValue } from "@/modules/app/sections/OnboardingBirthdateSection";
import type { OnboardingStepId } from "@/modules/app/lib/onboarding-data";
import { toGregorian } from "@/shared/lib/jalali";

export const PREMADE_AVATARS = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%23FF7A1A' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23fff'/%3E%3Cpath fill='%23fff' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%231A1A1A' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23FF7A1A'/%3E%3Cpath fill='%23FF7A1A' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect fill='%23FFE4CC' width='120' height='120'/%3E%3Ccircle cx='60' cy='44' r='22' fill='%23FF7A1A'/%3E%3Cpath fill='%23FF7A1A' d='M24 104c6-24 30-34 36-34s30 10 36 34z'/%3E%3C/svg%3E",
] as const;

export function readDocumentDirection(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "rtl";
  return document.documentElement.getAttribute("dir") === "ltr" ? "ltr" : "rtl";
}

export function birthdateToIso(value: OnboardingBirthdateValue): string {
  const { gy, gm, gd } = toGregorian(value.year, value.month, value.day);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function ageFromJalali(value: OnboardingBirthdateValue): number {
  const { gy, gm, gd } = toGregorian(value.year, value.month, value.day);
  const today = new Date();
  let age = today.getFullYear() - gy;
  const monthDelta = today.getMonth() + 1 - gm;
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < gd)) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function slideTitleKey(step: OnboardingStepId): string {
  return `${step}.title`;
}

export function slideSubtitleKey(step: OnboardingStepId): string | null {
  if (step === "review") return `${step}.subtitle`;
  return null;
}

export function slideOwnsChrome(step: OnboardingStepId): boolean {
  return (
    step === "review" ||
    step === "personalIntro" ||
    step === "identity" ||
    step === "avatar"
  );
}

/** Full-bleed photo slides that need a footer scrim for the CTA. */
export function slideIsHeroBleed(step: OnboardingStepId): boolean {
  return step === "review" || step === "personalIntro";
}

/** Slides that fill the stage edge-to-edge (hero photos). */
export function slideIsBleed(step: OnboardingStepId): boolean {
  return slideIsHeroBleed(step);
}

export function formatJalaliDisplay(value: OnboardingBirthdateValue): string {
  return `${value.day} / ${value.month} / ${value.year}`;
}
