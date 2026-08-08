export type FormStepperStep = {
  key: string;
  label: string;
};

export type FormStepperProps = {
  steps: FormStepperStep[];
  /** 0-based index of the current step. */
  activeIndex: number;
  /** Accessible label for the stepper nav. */
  "aria-label"?: string;
  className?: string;
};
