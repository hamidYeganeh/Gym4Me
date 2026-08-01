import type { MotionValue } from "motion/react";

export interface FractionalPickerProps {
  min?: number;
  max?: number;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Defaults to `min`. */
  defaultValue?: number;
  itemWidth?: number;
  onChange?: (value: number) => void;
  className?: string;
  "aria-label"?: string;
}

export interface RulerItemProps {
  value: number;
  min: number;
  x: MotionValue<number>;
  itemWidth: number;
  max: number;
  /** Resolved theme color for the active (nearest) value. */
  nearColor: string;
  /** Resolved theme color for distant values. */
  farColor: string;
}
