"use client";

import { useCallback, useState } from "react";
import { AthleteSubscriptionScreen } from "../screens/AthleteSubscriptionScreen";
import { DEFAULT_ATHLETE_SUBSCRIPTION } from "./athlete-subscription-data";

export function AthleteSubscriptionGate() {
  const [currentPlanId, setCurrentPlanId] = useState(
    DEFAULT_ATHLETE_SUBSCRIPTION.currentPlanId,
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
      onUpgrade={onUpgrade}
      pending={pending}
      plans={DEFAULT_ATHLETE_SUBSCRIPTION.plans}
    />
  );
}
