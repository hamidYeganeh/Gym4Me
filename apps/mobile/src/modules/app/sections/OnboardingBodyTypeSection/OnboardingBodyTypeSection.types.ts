import type {
  OnboardingBodyTypeId,
  OnboardingGenderId,
} from "@/modules/app/lib/onboarding-data";

export type OnboardingBodyTypeOption = {
  id: OnboardingBodyTypeId;
  label: string;
  statement: string;
};

export type OnboardingBodyTypeSectionProps = {
  options: OnboardingBodyTypeOption[];
  value: OnboardingBodyTypeId | null;
  gender: OnboardingGenderId | null;
  onChange: (value: OnboardingBodyTypeId) => void;
  className?: string;
};
