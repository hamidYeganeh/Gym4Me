"use client";

import { useCallback, useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { AthleteFamilyAccountsScreen } from "../screens/AthleteFamilyAccountsScreen";
import {
  DEFAULT_CHILD_PROFILES,
  type AddChildInput,
  type ChildProfile,
} from "./athlete-family-data";

export function AthleteFamilyAccountsGate() {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(
    DEMO_MODE ? DEFAULT_CHILD_PROFILES : [],
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAddChild = useCallback(async (input: AddChildInput) => {
    if (!DEMO_MODE) {
      setError("ثبت پروفایل فرزند هنوز به سرویس واقعی متصل نیست.");
      return;
    }
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setChildProfiles((current) => [
        ...current,
        {
          id: `local-${Date.now()}`,
          name: input.name,
          birthDateLabel: new Date(input.birthDate).toLocaleDateString("fa-IR"),
          consentStatus: "pending",
        },
      ]);
      setMessage("پروفایل فرزند اضافه شد. در انتظار تأیید رضایت.");
    } catch {
      setError("افزودن فرزند ناموفق بود.");
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <AthleteFamilyAccountsScreen
      childProfiles={childProfiles}
      error={error}
      message={message}
      onAddChild={onAddChild}
      pending={pending}
    />
  );
}
