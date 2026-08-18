import type { ReactNode, Ref } from "react";

export type PhoneFieldProps = {
  value: string;
  /** Visible label. Hidden visually when `hideLabel` is true (still used for a11y). */
  label: string;
  placeholder: string;
  name?: string;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  /** Hide the visible label (keeps `aria-label` on the input). */
  hideLabel?: boolean;
  /** Visible dialing code (LTR). Defaults to Iranian +98. */
  countryCode?: string;
  /** Flag glyph or custom node (e.g. SVG from countries API) next to the code. */
  countryFlag?: ReactNode;
  /** Show a decorative country chevron next to the flag (non-interactive). */
  showCountryChevron?: boolean;
  /** Tooltip copy shown when the help control is pressed. */
  helpText?: string;
  /** Accessible label for the help control. */
  helpLabel?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};
