import type { Ref } from "react";

export type AuthPhoneFieldProps = {
  value: string;
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};
