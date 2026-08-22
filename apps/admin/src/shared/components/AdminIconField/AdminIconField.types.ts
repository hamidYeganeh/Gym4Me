import type { RefCallback, RefObject } from "react";

export type AdminIconFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  inputRef?:
    | RefCallback<HTMLInputElement>
    | RefObject<HTMLInputElement | null>
    | null;
  className?: string;
};
