"use client";

import { useCallback, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { AthletePassesScreen } from "../screens/AthletePassesScreen";
import { DEFAULT_ATHLETE_PASSES, type PassKind } from "./athlete-passes-data";

export function AthletePassesGate() {
  const [activeKind, setActiveKind] = useState<PassKind>("trial");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClaim = useCallback(async (offerId: string) => {
    if (!DEMO_MODE) return;
    setPending(true);
    setMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMessage(`درخواست ${offerId} ثبت شد.`);
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthletePassesScreen
      activeKind={activeKind}
      message={message}
      offers={DEMO_MODE ? DEFAULT_ATHLETE_PASSES.offers : []}
      onClaim={DEMO_MODE ? onClaim : undefined}
      onKindChange={setActiveKind}
      owned={DEMO_MODE ? DEFAULT_ATHLETE_PASSES.owned : []}
      pending={pending}
    />
  );
}
