import type {
  MetricGoal,
  MetricGoalOperator,
  MetricGoalPeriod,
  MetricReminderStatus,
} from "@repo/api";

export const GOAL_PERIOD_OPTIONS: { value: MetricGoalPeriod; label: string }[] =
  [
    { value: "daily", label: "روزانه" },
    { value: "weekly", label: "هفتگی" },
    { value: "rolling_7d", label: "۷ روز غلتان" },
  ];

export const GOAL_OPERATOR_OPTIONS: {
  value: MetricGoalOperator;
  label: string;
}[] = [
  { value: "gte", label: "حداقل" },
  { value: "lte", label: "حداکثر" },
  { value: "eq", label: "مساوی" },
];

export function goalStatusLabel(status: MetricGoal["status"]) {
  switch (status) {
    case "active":
      return "فعال";
    case "paused":
      return "متوقف";
    case "completed":
      return "کامل";
    case "archived":
      return "بایگانی";
    default:
      return status;
  }
}

export function reminderStatusLabel(status: MetricReminderStatus) {
  switch (status) {
    case "active":
      return "فعال (opt-in)";
    case "paused":
      return "متوقف (پیش‌فرض)";
    case "archived":
      return "بایگانی";
    default:
      return status;
  }
}
