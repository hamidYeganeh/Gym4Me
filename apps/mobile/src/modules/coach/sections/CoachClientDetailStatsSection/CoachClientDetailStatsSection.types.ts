import type { CoachClientDetail } from "../../lib/coach-clients-data";

export type CoachClientDetailStatsSectionProps = {
  monthlySessionsSeries: CoachClientDetail["monthlySessionsSeries"];
  monthlySessionsValue: CoachClientDetail["monthlySessionsValue"];
  adherenceSeries: CoachClientDetail["adherenceSeries"];
  adherenceValue: CoachClientDetail["adherenceValue"];
};
