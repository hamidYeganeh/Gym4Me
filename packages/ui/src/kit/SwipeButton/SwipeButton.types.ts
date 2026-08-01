import type { ReactNode } from "react";
import type { SwipeButtonVariantProps } from "./SwipeButton.styles";

export type SwipeButtonColor = NonNullable<SwipeButtonVariantProps["color"]>;

export interface SwipeButtonProps {
  /** Instructional label shown on the track (e.g. "Swipe to finish activity"). */
  label: ReactNode;
  /** Called once the thumb reaches the end of the track. */
  onComplete?: () => void;
  /**
   * Semantic track color. Defaults to `warning` (orange, matching the design).
   * Overridden when `trackColor` is set.
   */
  color?: SwipeButtonColor;
  /** Custom track background (CSS color). Overrides `color` variant. */
  trackColor?: string;
  /** Custom label color (CSS color). */
  labelColor?: string;
  /** Custom thumb background (CSS color). */
  thumbColor?: string;
  /** Custom icon color (CSS color). */
  iconColor?: string;
  /** Icon inside the thumb. Defaults to double chevron. */
  icon?: ReactNode;
  /** Fraction of travel (0–1) required to complete. Defaults to `0.85`. */
  threshold?: number;
  /** When true, the control stays completed after a successful swipe. */
  stayCompleted?: boolean;
  /** Controlled completed state. */
  completed?: boolean;
  /** Uncontrolled initial completed state. */
  defaultCompleted?: boolean;
  /** Disables drag interaction. */
  disabled?: boolean;
  className?: string;
  thumbClassName?: string;
  labelClassName?: string;
  "aria-label"?: string;
}
