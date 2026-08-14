"use client";

import { Spinner, Typography } from "@heroui/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachNutritionPlanScreen } from "../screens/CoachNutritionPlanScreen";
import {
  getCoachNutritionPlan,
  type CoachNutritionPlan,
} from "./coach-nutrition-data";

export function CoachNutritionPlanGate({ planId }: { planId: string }) {
  const { isReady } = useAuth();
  const [plan, setPlan] = useState<CoachNutritionPlan | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isReady) return;
    setPlan(getCoachNutritionPlan(planId));
  }, [isReady, planId]);

  if (plan === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          برنامه غذایی پیدا نشد.
        </Typography>
      </div>
    );
  }

  return <CoachNutritionPlanScreen plan={plan} />;
}
