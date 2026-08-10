export interface HeightSliderProps {
  min?: number;
  max?: number;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Defaults to midpoint of min/max. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  "aria-label"?: string;
}
