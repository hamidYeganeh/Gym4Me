"use client";

import { useCallback, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { AthleteSubscriptionScreen } from "../screens/AthleteSubscriptionScreen";
import { DEFAULT_ATHLETE_SUBSCRIPTION } from "./athlete-subscription-data";

export function AthleteSubscriptionGate() {
  const [currentPlanId, setCurrentPlanId] = useState(
    DEMO_MODE ? DEFAULT_ATHLETE_SUBSCRIPTION.currentPlanId : "",
  );
  const [pending, setPending] = useState(false);

  const onUpgrade = useCallback(async (planId: string) => {
    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCurrentPlanId(planId);
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteSubscriptionScreen
      currentPlanId={currentPlanId}
      onUpgrade={DEMO_MODE ? onUpgrade : undefined}
      pending={pending}
      plans={DEMO_MODE ? DEFAULT_ATHLETE_SUBSCRIPTION.plans : []}
    />
  );
}
