"use client";

import { Spinner } from "@heroui/react/spinner";
import type { MealAdherenceStatus } from "@repo/api/nutrition";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountNutrition, mediaApi } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteNutritionLogScreen } from "../screens/AthleteNutritionLogScreen";
import {
  DEMO_MEAL_LOGS,
  DEMO_MEAL_PLANS,
  mapMealAdherence,
  type AthleteMealLogItem,
} from "./nutrition-data";

export function AthleteNutritionLogGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [logs, setLogs] = useState<AthleteMealLogItem[] | null>(null);
  const [pending, setPending] = useState(false);
  const objectUrls = useRef(new Set<string>());

  const clearObjectUrls = useCallback(() => {
    for (const url of objectUrls.current) URL.revokeObjectURL(url);
    objectUrls.current.clear();
  }, []);

  const reload = useCallback(async () => {
    const [adherence, plans] = await Promise.all([
      accountNutrition.listAdherence({ page_size: 50 }),
      accountNutrition.listMealPlans({ page_size: 100 }),
    ]);
    const titleById = new Map(
      plans.result.map((plan) => [plan.id, plan.title] as const),
    );
    clearObjectUrls();
    const mapped = await Promise.all(
      adherence.result.map(async (entry) => {
        const item = mapMealAdherence(
          entry,
          titleById.get(entry.mealPlanId) ?? "برنامه غذایی",
        );
        if (entry.mediaId) {
          try {
            const blob = await mediaApi.download(entry.mediaId);
            item.mediaUrl = URL.createObjectURL(blob);
            objectUrls.current.add(item.mediaUrl);
          } catch {
            item.mediaUrl = null;
          }
        }
        return item;
      }),
    );
    setLogs(mapped);
  }, [clearObjectUrls]);

  useEffect(() => clearObjectUrls, [clearObjectUrls]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setLogs(DEMO_MODE ? DEMO_MEAL_LOGS : []);
      return;
    }

    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setLogs(DEMO_MODE ? DEMO_MEAL_LOGS : []);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, reload]);

  const handleQuickLog = useCallback(
    async (status: MealAdherenceStatus, file?: File) => {
      if (!isAuthenticated) {
        if (!DEMO_MODE) return;
        const planId = DEMO_MEAL_PLANS[0]?.id;
        if (!planId) return;
        setLogs((prev) => [
          {
            id: `demo-local-${Date.now()}`,
            mealPlanId: planId,
            planTitle: DEMO_MEAL_PLANS[0]!.title,
            dayIndex: 0,
            mealIndex: 0,
            status,
            loggedLabel: "همین حالا",
            note: null,
            mediaId: null,
            mediaUrl: file ? URL.createObjectURL(file) : null,
          },
          ...(prev ?? []),
        ]);
        return;
      }

      setPending(true);
      try {
        const plans = await accountNutrition.listMealPlans({
          status: "active",
          page_size: 1,
        });
        const active = plans.result[0];
        if (!active) return;
        const uploaded = file
          ? await mediaApi.upload(file, file.name, {
              visibility: "private",
              purpose: "meal_adherence",
            })
          : null;
        await accountNutrition.createAdherence({
          idempotencyKey: `meal-log:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
          mealPlanId: active.id,
          slot: { dayIndex: 0, mealIndex: 0 },
          status,
          mediaId: uploaded?.id,
        });
        await reload();
      } catch {
        // keep
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, reload],
  );

  if (!logs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteNutritionLogScreen
      logs={logs}
      onQuickLog={handleQuickLog}
      pending={pending}
    />
  );
}
