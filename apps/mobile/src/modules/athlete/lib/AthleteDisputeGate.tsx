"use client";

import { useCallback, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { AthleteDisputeScreen } from "../screens/AthleteDisputeScreen";
import {
  DEFAULT_ATHLETE_DISPUTES,
  type AthleteDispute,
  type CreateDisputeInput,
} from "./athlete-dispute-data";

export function AthleteDisputeGate() {
  const [disputes, setDisputes] = useState<AthleteDispute[]>(
    DEMO_MODE ? DEFAULT_ATHLETE_DISPUTES : [],
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async (input: CreateDisputeInput) => {
    if (!DEMO_MODE) {
      setError("ثبت اعتراض هنوز به سرویس واقعی متصل نیست.");
      return;
    }
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setDisputes((current) => [
        {
          id: `local-${Date.now()}`,
          category: input.category,
          relatedEntityId: input.relatedEntityId,
          body: input.body,
          status: "open",
          createdAtLabel: "همین الان",
        },
        ...current,
      ]);
      setMessage("اعتراض با موفقیت ثبت شد.");
    } catch {
      setError("ثبت اعتراض ناموفق بود.");
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteDisputeScreen
      disputes={disputes}
      error={error}
      message={message}
      onSubmit={onSubmit}
      pending={pending}
    />
  );
}
