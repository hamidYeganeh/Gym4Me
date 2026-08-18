"use client";

import { Spinner } from "@heroui/react/spinner";
import { useCallback, useEffect, useState } from "react";
import { accountNutrition } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteNutritionPlanScreen } from "../screens/AthleteNutritionPlanScreen";
import type { MealAdherenceStatus } from "@repo/api/nutrition";
import {
  DEMO_MEAL_PLAN_DETAIL,
  DEMO_MEAL_PLANS,
  mapMealPlanDetail,
  type AthleteMealPlanDetail,
} from "./nutrition-data";

export function AthleteNutritionPlanGate({ planId }: { planId: string }) {
  const { isAuthenticated, isReady } = useAuth();
  const [detail, setDetail] = useState<AthleteMealPlanDetail | null>(null);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

  const loadDemo = useCallback(() => {
    const demo = DEMO_MEAL_PLANS.find((plan) => plan.id === planId);
    setDetail(
      demo
        ? { ...DEMO_MEAL_PLAN_DETAIL, ...demo, days: DEMO_MEAL_PLAN_DETAIL.days }
        : { ...DEMO_MEAL_PLAN_DETAIL, id: planId },
    );
  }, [planId]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      loadDemo();
      return;
    }

    let cancelled = false;
    accountNutrition
      .getMealPlan(planId)
      .then((plan) => {
        if (!cancelled) setDetail(mapMealPlanDetail(plan));
      })
      .catch(() => {
        if (!cancelled) loadDemo();
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, loadDemo, planId]);

  const handleLogMeal = useCallback(
    async (
      dayIndex: number,
      mealIndex: number,
      status: MealAdherenceStatus,
    ) => {
      const key = `${dayIndex}:${mealIndex}`;
      if (!isAuthenticated) {
        setPendingSlot(key);
        setTimeout(() => setPendingSlot(null), 400);
        return;
      }

      setPendingSlot(key);
      try {
        await accountNutrition.createAdherence({
          mealPlanId: planId,
          slot: { dayIndex, mealIndex },
          status,
        });
      } catch {
        // ignore
      } finally {
        setPendingSlot(null);
      }
    },
    [isAuthenticated, planId],
  );

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteNutritionPlanScreen
      detail={detail}
      onLogMeal={handleLogMeal}
      pendingSlot={pendingSlot}
    />
  );
}
