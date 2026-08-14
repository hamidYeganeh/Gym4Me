"use client";

import { useCallback, useState } from "react";
import { AthleteQrCheckInScreen } from "../screens/AthleteQrCheckInScreen";
import {
  DEFAULT_QR_CHECKIN,
  refreshQrCode,
  type QrCheckInState,
} from "./athlete-qr-checkin-data";

export function AthleteQrCheckInGate() {
  const [state, setState] = useState<QrCheckInState>(DEFAULT_QR_CHECKIN);
  const [pending, setPending] = useState(false);

  const onRefresh = useCallback(async () => {
    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setState((current) => ({ ...current, ...refreshQrCode() }));
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteQrCheckInScreen
      code={state.code}
      expiresAtLabel={state.expiresAtLabel}
      onRefresh={onRefresh}
      pending={pending}
      recentCheckIns={state.recentCheckIns}
    />
  );
}
