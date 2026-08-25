"use client";

import type {
  CreateMetricGoalInput,
  MetricGoalOperator,
  MetricGoalPeriod,
  UpsertMetricReminderInput,
} from "@repo/api";
import { useState } from "react";
import type { AthleteGoalsScreenProps } from "../screens/AthleteGoalsScreen/AthleteGoalsScreen.types";

export function useAthleteGoals({
  metricOptions,
  pending = false,
  onCreateGoal,
  onUpdateGoalStatus,
  onUpsertReminder,
}: AthleteGoalsScreenProps) {
  const [metricKey, setMetricKey] = useState(metricOptions[0]?.key ?? "steps");
  const [operator, setOperator] = useState<MetricGoalOperator>("gte");
  const [targetValue, setTargetValue] = useState("10000");
  const [period, setPeriod] = useState<MetricGoalPeriod>("daily");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reminderKey, setReminderKey] = useState(
    metricOptions[0]?.key ?? "steps",
  );
  const [localTime, setLocalTime] = useState("09:00");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [enableReminder, setEnableReminder] = useState(false);

  async function submitGoal() {
    const value = Number(targetValue);
    if (!Number.isFinite(value)) return;
    setMessage(null);
    setError(null);
    const input: CreateMetricGoalInput = {
      metricKey,
      target: {
        operator,
        value,
        unit: metricOptions.find((item) => item.key === metricKey)?.unit,
      },
      period,
      effective: { start: new Date().toISOString() },
      status: "active",
    };
    try {
      await onCreateGoal(input);
      setMessage("هدف با موفقیت ثبت شد.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ثبت هدف ناموفق بود.");
    }
  }

  async function submitReminder() {
    setMessage(null);
    setError(null);
    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tehran";
    const input: UpsertMetricReminderInput = {
      schedule: {
        timezone,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        localTime,
      },
      quietHours: {
        start: quietStart,
        end: quietEnd,
      },
      channel: "push",
      status: enableReminder ? "active" : "paused",
    };
    try {
      await onUpsertReminder(reminderKey, input);
      setMessage(
        enableReminder
          ? "یادآوری فعال شد."
          : "یادآوری ذخیره شد و فعلاً غیرفعال است.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ذخیره یادآوری ناموفق بود.",
      );
    }
  }

  return {
    metricOptions,
    pending,
    metricKey,
    operator,
    targetValue,
    period,
    message,
    error,
    reminderKey,
    localTime,
    quietStart,
    quietEnd,
    enableReminder,
    setMetricKey,
    setOperator,
    setTargetValue,
    setPeriod,
    setReminderKey,
    setLocalTime,
    setQuietStart,
    setQuietEnd,
    setEnableReminder,
    submitGoal,
    submitReminder,
    onUpdateGoalStatus,
  };
}

export type UseAthleteGoalsReturn = ReturnType<typeof useAthleteGoals>;
