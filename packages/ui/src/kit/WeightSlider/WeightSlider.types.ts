import type { ReactNode } from "react";
import type { MotionValue } from "motion/react";

export interface WeightSliderProps {
  min?: number;
  max?: number;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Defaults to 25. */
  defaultValue?: number;
  /** @deprecated Prefer `defaultValue`. Kept for prompt compatibility. */
  initialValue?: number;
  onChange?: (value: number) => void;
  /** Heading above the dial (e.g. "Weight"). */
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export interface WeightSliderDialItemProps {
  value: number;
  pixelsPerUnit: number;
  scrollX: MotionValue<number>;
  /** Resolved `--foreground` for the active dial number. */
  nearColor: string;
  /** Resolved `--muted` for distant dial numbers. */
  farColor: string;
}
