"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteWorkoutsScreen } from "../screens/AthleteWorkoutsScreen";
import { mapWorkoutPlan } from "./map-workout-plans";
import {
  DEMO_WORKOUT_PLANS,
  type AthleteWorkoutPlanItem,
} from "./workout-programs-data";

export function AthleteWorkoutsGate() {
  const { isAuthenticated, isReady } = useAuth();
  const [plans, setPlans] = useState<AthleteWorkoutPlanItem[] | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPlans(DEMO_WORKOUT_PLANS);
      return;
    }

    let cancelled = false;
    accountProgress
      .listWorkoutPlans({ page_size: 100 })
      .then((page) => {
        if (cancelled) return;
        setPlans(
          page.result.length > 0
            ? page.result.map(mapWorkoutPlan)
            : DEMO_WORKOUT_PLANS,
        );
      })
      .catch(() => {
        if (!cancelled) setPlans(DEMO_WORKOUT_PLANS);
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

  return <AthleteWorkoutsScreen plans={plans} />;
}
