import type { UseOnboardingReturn } from "@/modules/app/lib/use-onboarding";

export type OnboardingFooterSectionProps = Pick<
  UseOnboardingReturn,
  | "t"
  | "isCaloriesStep"
  | "isAvatarStep"
  | "isAvatarUploading"
  | "hasAvatar"
  | "canContinue"
  | "goNext"
  | "handleCaloriesUnknown"
> & {
  className?: string;
};
