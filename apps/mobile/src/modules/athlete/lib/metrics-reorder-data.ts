export type ReorderableMetricId =
  | "weight"
  | "blood-pressure"
  | "heart-rate"
  | "sleep"
  | "nutrition"
  | "hydration"
  | "respiration";

export type ReorderableMetric = {
  id: ReorderableMetricId;
};

/** Default manage-metrics order from the design mock. */
export const DEFAULT_REORDERABLE_METRICS: ReorderableMetric[] = [
  { id: "weight" },
  { id: "blood-pressure" },
  { id: "heart-rate" },
  { id: "sleep" },
  { id: "nutrition" },
  { id: "hydration" },
  { id: "respiration" },
];
