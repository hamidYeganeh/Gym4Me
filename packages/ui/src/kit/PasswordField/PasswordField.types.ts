import type { Ref } from "react";

export type PasswordFieldProps = {
  value: string;
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
  autoComplete?: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};
