import type {
  CreateMetricGoalInput,
  MetricGoal,
  MetricGoalStatus,
  MetricReminder,
  UpsertMetricReminderInput,
} from "@repo/api";

export type AthleteGoalMetricOption = {
  key: string;
  label: string;
  unit?: string;
};

export type AthleteGoalsScreenProps = {
  goals: MetricGoal[];
  reminders: MetricReminder[];
  metricOptions: AthleteGoalMetricOption[];
  pending?: boolean;
  onCreateGoal: (input: CreateMetricGoalInput) => Promise<void>;
  onUpdateGoalStatus: (
    id: string,
    status: MetricGoalStatus,
  ) => Promise<void>;
  onUpsertReminder: (
    metricKey: string,
    input: UpsertMetricReminderInput,
  ) => Promise<void>;
};
