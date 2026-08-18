"use client";

import { Spinner } from "@heroui/react/spinner";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachNutritionScreen } from "../screens/CoachNutritionScreen";
import {
  COACH_NUTRITION_PLANS,
  type CoachNutritionPlan,
} from "./coach-nutrition-data";

export function CoachNutritionGate() {
  const { isReady } = useAuth();
  const [plans, setPlans] = useState<CoachNutritionPlan[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    setPlans(COACH_NUTRITION_PLANS);
  }, [isReady]);

  if (!plans) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <CoachNutritionScreen plans={plans} />;
}
