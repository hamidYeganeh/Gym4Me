import type { Ref } from "react";

export type PasswordFieldProps = {
  value: string;
  /** Visible label. Hidden visually when `hideLabel` is true (still used for a11y). */
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
  /** Defaults to `off` so browsers do not offer saved credentials. */
  autoComplete?: string;
  /** Hide the visible label (keeps `aria-label` on the input). */
  hideLabel?: boolean;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};
