export type BusyHoursCardPoint = {
  /** Axis / hour label (e.g. `۶` / `18`). */
  label: string;
  /** Busyness 0–100. */
  value: number;
};

export type BusyHoursCardProps = {
  title: string;
  data: BusyHoursCardPoint[];
  /**
   * Optional comparison series for the ghost line.
   * When omitted, a smoothed dampened curve is derived from `data`.
   */
  compareData?: BusyHoursCardPoint[];
  /**
   * Large footer metric. Defaults to the peak value in `data`.
   */
  value?: string | number;
  /** Unit after the value (e.g. `%` / `٪`). */
  unit?: string;
  /** Accessible label for the chart. */
  "aria-label"?: string;
  className?: string;
};
