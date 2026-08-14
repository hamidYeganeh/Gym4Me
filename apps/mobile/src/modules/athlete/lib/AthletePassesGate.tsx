"use client";

import { useCallback, useState } from "react";
import { AthletePassesScreen } from "../screens/AthletePassesScreen";
import {
  DEFAULT_ATHLETE_PASSES,
  type PassKind,
} from "./athlete-passes-data";

export function AthletePassesGate() {
  const [activeKind, setActiveKind] = useState<PassKind>("trial");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClaim = useCallback(async (offerId: string) => {
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
      offers={DEFAULT_ATHLETE_PASSES.offers}
      onClaim={onClaim}
      onKindChange={setActiveKind}
      owned={DEFAULT_ATHLETE_PASSES.owned}
      pending={pending}
    />
  );
}
