"use client";

import { useCallback, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { AthleteQrCheckInScreen } from "../screens/AthleteQrCheckInScreen";
import {
  DEFAULT_QR_CHECKIN,
  refreshQrCode,
  type QrCheckInState,
} from "./athlete-qr-checkin-data";

export function AthleteQrCheckInGate() {
  const [state, setState] = useState<QrCheckInState>(
    DEMO_MODE
      ? DEFAULT_QR_CHECKIN
      : { code: "—", expiresAtLabel: "در دسترس نیست", recentCheckIns: [] },
  );
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
      onRefresh={DEMO_MODE ? onRefresh : undefined}
      pending={pending}
      recentCheckIns={state.recentCheckIns}
    />
  );
}
