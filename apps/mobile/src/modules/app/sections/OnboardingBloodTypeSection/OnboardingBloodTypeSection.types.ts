import type {
  OnboardingBloodGroup,
  OnboardingRhFactor,
} from "@/modules/app/lib/onboarding-data";

export type OnboardingBloodTypeSectionProps = {
  groups: OnboardingBloodGroup[];
  group: OnboardingBloodGroup;
  rh: OnboardingRhFactor;
  groupAria: string;
  rhAria: string;
  onGroupChange: (group: OnboardingBloodGroup) => void;
  onRhChange: (rh: OnboardingRhFactor) => void;
  className?: string;
};
