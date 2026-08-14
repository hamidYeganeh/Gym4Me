"use client";

import { Spinner } from "@heroui/react";
import type {
  CreateMetricGoalInput,
  MetricGoal,
  MetricGoalStatus,
  MetricReminder,
  UpsertMetricReminderInput,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { SELF_TRACKING_METRICS } from "./self-tracking-data";
import { accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteGoalsScreen } from "../screens/AthleteGoalsScreen";

export function AthleteGoalsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [goals, setGoals] = useState<MetricGoal[] | null>(null);
  const [reminders, setReminders] = useState<MetricReminder[]>([]);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setGoals([]);
      setReminders([]);
      return;
    }
    const [goalPage, reminderPage] = await Promise.all([
      accountProgress.listGoals({ page_size: 50 }),
      accountProgress.listReminders({ page_size: 50 }),
    ]);
    setGoals(goalPage.result);
    setReminders(reminderPage.result);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    void load().catch(() => {
      setGoals([]);
      setReminders([]);
    });
  }, [isReady, load]);

  if (!goals) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteGoalsScreen
      goals={goals}
      metricOptions={SELF_TRACKING_METRICS.map((item) => ({
        key: item.key,
        label: item.label,
        unit: item.unit,
      }))}
      onCreateGoal={async (input: CreateMetricGoalInput) => {
        setPending(true);
        try {
          await accountProgress.createGoal(input);
          await load();
        } finally {
          setPending(false);
        }
      }}
      onUpdateGoalStatus={async (id, status: MetricGoalStatus) => {
        setPending(true);
        try {
          await accountProgress.updateGoal(id, { status });
          await load();
        } finally {
          setPending(false);
        }
      }}
      onUpsertReminder={async (
        metricKey: string,
        input: UpsertMetricReminderInput,
      ) => {
        setPending(true);
        try {
          await accountProgress.upsertReminder(metricKey, input);
          await load();
        } finally {
          setPending(false);
        }
      }}
      pending={pending}
      reminders={reminders}
    />
  );
}
