import type { UseOnboardingReturn } from "@/modules/app/lib/use-onboarding";

export type OnboardingFooterSectionProps = Pick<
  UseOnboardingReturn,
  | "t"
  | "isExperienceStep"
  | "isCaloriesStep"
  | "isAvatarUploading"
  | "canContinue"
  | "calories"
  | "caloriesKnown"
  | "goNext"
  | "chooseExperience"
  | "handleCaloriesUnknown"
> & {
  className?: string;
};
