"use client";

import { Spinner } from "@heroui/react/spinner";
import { useEffect, useState } from "react";
import { accountNutrition } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteNutritionScreen } from "../screens/AthleteNutritionScreen";
import {
  DEMO_MEAL_PLANS,
  mapMealPlan,
  type AthleteMealPlanItem,
} from "./nutrition-data";

export function AthleteNutritionGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [plans, setPlans] = useState<AthleteMealPlanItem[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPlans(DEMO_MODE ? DEMO_MEAL_PLANS : []);
      return;
    }

    let cancelled = false;
    accountNutrition
      .listMealPlans({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        setPlans(page.result.map(mapMealPlan));
      })
      .catch(() => {
        if (!cancelled) setPlans(DEMO_MODE ? DEMO_MEAL_PLANS : []);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  if (!plans) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AthleteNutritionScreen plans={plans} />;
}
