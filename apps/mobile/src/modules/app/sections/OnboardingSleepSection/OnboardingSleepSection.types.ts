import type { OnboardingSleepLevel } from "@/modules/app/lib/onboarding-data";

export type OnboardingSleepOption = {
  level: OnboardingSleepLevel;
  label: string;
  description: string;
};

export type OnboardingSleepSectionProps = {
  options: OnboardingSleepOption[];
  value: OnboardingSleepLevel;
  onChange: (value: OnboardingSleepLevel) => void;
  className?: string;
};
