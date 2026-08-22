import type { Key } from "react";

export type AdminFilterSelectOption = {
  value: string;
  label: string;
};

export type AdminFilterSelectChangeValue = Key | Key[] | null;

export type AdminFilterSelectProps = {
  label: string;
  value: string;
  options: readonly AdminFilterSelectOption[];
  /** Included as the first option when provided. */
  allLabel?: string;
  allValue?: string;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
};
