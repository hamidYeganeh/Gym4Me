import type { FormStepperStep } from "@repo/ui/kit/FormStepper";

export type OnboardingPhaseIntroSectionProps = {
  title: string;
  subtitle: string;
  imageAlt: string;
  steps: FormStepperStep[];
  activePhaseIndex: number;
  phaseAria: string;
  className?: string;
};
