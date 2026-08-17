import type { WeightDetail } from "@/modules/athlete/lib/weight/weight-detail-data";

export type AthleteWeightDetailKeyMetricsSectionProps = {
  metrics: WeightDetail["metrics"];
  unit: string;
  className?: string;
};
