import type { UseOnboardingReturn } from "@/modules/app/lib/use-onboarding";

export type OnboardingFooterSectionProps = Pick<
  UseOnboardingReturn,
  | "t"
  | "isCaloriesStep"
  | "isAvatarStep"
  | "isAvatarUploading"
  | "canContinue"
  | "calories"
  | "caloriesKnown"
  | "goNext"
  | "handleCaloriesUnknown"
  | "requestFinish"
> & {
  className?: string;
};
