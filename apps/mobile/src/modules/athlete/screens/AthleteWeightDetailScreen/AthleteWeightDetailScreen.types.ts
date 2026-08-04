import type { MetricSlug } from "@/modules/athlete/lib/weight/metrics";
import type { WeightDetail } from "@/modules/athlete/lib/weight/weight-detail-data";

export type AthleteWeightDetailScreenProps = {
  metric: MetricSlug;
  detail: WeightDetail;
};
