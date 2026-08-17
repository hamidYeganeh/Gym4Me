import type { WeightDetail } from "@/modules/athlete/lib/weight/weight-detail-data";

export type AthleteWeightDetailHeroSectionProps = {
  detail: WeightDetail;
  unit: string;
  className?: string;
};
