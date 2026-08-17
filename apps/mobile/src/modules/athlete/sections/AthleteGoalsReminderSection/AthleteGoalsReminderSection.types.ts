import type { MetricReminder } from "@repo/api";
import type { AthleteGoalMetricOption } from "@/modules/athlete/screens/AthleteGoalsScreen/AthleteGoalsScreen.types";

export type AthleteGoalsReminderSectionProps = {
  metricOptions: AthleteGoalMetricOption[];
  reminders: MetricReminder[];
  reminderKey: string;
  localTime: string;
  quietStart: string;
  quietEnd: string;
  enableReminder: boolean;
  pending?: boolean;
  onReminderKeyChange: (value: string) => void;
  onLocalTimeChange: (value: string) => void;
  onQuietStartChange: (value: string) => void;
  onQuietEndChange: (value: string) => void;
  onEnableReminderChange: (value: boolean) => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};
