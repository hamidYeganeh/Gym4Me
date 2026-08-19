import type { UseOnboardingReturn } from "@/modules/app/lib/use-onboarding";

export type OnboardingFooterSectionProps = Pick<
  UseOnboardingReturn,
  | "t"
  | "isCaloriesStep"
  | "isAvatarUploading"
  | "canContinue"
  | "calories"
  | "caloriesKnown"
  | "goNext"
  | "handleCaloriesUnknown"
> & {
  className?: string;
};
