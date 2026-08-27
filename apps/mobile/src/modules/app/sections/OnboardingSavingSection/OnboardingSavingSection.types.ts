import type {
  OnboardingSaveStepStatus,
  OnboardingSaveStepView,
} from "@/modules/app/lib/onboarding-save";

export type OnboardingSavingStepView = OnboardingSaveStepView & {
  label: string;
};

export type OnboardingSavingSectionProps = {
  ariaLabel: string;
  steps: OnboardingSavingStepView[];
  loopWords: string[];
  headlinePrefix: string;
  retryLabel: string;
  errorLabel: string;
  onRetry: () => void;
  className?: string;
};

export type OnboardingSavingRowStatus = OnboardingSaveStepStatus;
