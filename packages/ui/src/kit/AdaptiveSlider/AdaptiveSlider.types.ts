import type { ChangeEvent, ReactNode } from "react";

export interface AdaptiveSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Optional heading above the value (e.g. "Calories") */
  label?: ReactNode;
  /** Optional unit next to the value (e.g. "kCal") */
  unit?: ReactNode;
  /** Show the animated numeric value. Defaults to true. */
  showValue?: boolean;
  className?: string;
  trackClassName?: string;
  "aria-label"?: string;
  id?: string;
}

export type AdaptiveSliderTone = "low" | "mid" | "high";

export interface AnimatedTextProps {
  value: string;
  className?: string;
}

export type AdaptiveSliderChangeEvent = ChangeEvent<HTMLInputElement>;
