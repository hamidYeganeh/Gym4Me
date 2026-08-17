import type { Ref } from "react";

export type PhoneFieldProps = {
  value: string;
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  /** Visible dialing code (LTR). Defaults to Iranian +۹۸. */
  countryCode?: string;
  /** Flag glyph next to the code. Defaults to 🇮🇷. */
  countryFlag?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};
