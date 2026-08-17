import type { MetricGoal, MetricGoalStatus } from "@repo/api";

export type AthleteGoalsListSectionProps = {
  goals: MetricGoal[];
  pending?: boolean;
  onUpdateGoalStatus: (
    id: string,
    status: MetricGoalStatus,
  ) => void | Promise<void>;
  className?: string;
};
