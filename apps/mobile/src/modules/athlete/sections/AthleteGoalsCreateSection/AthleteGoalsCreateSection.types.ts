import type {
  MetricGoalOperator,
  MetricGoalPeriod,
} from "@repo/api";
import type { AthleteGoalMetricOption } from "@/modules/athlete/screens/AthleteGoalsScreen/AthleteGoalsScreen.types";

export type AthleteGoalsCreateSectionProps = {
  metricOptions: AthleteGoalMetricOption[];
  metricKey: string;
  operator: MetricGoalOperator;
  targetValue: string;
  period: MetricGoalPeriod;
  pending?: boolean;
  onMetricKeyChange: (value: string) => void;
  onOperatorChange: (value: MetricGoalOperator) => void;
  onTargetValueChange: (value: string) => void;
  onPeriodChange: (value: MetricGoalPeriod) => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};
