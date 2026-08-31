"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountNotifications } from "@/shared/lib/api";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import { NotificationSettingsScreen } from "../screens/NotificationSettingsScreen";
import { DEMO_NOTIFICATION_PREFERENCES } from "./notification-settings-data";

export function NotificationSettingsGate({
  roleSegment = "athlete",
}: {
  roleSegment?: "athlete" | "coach" | "owner";
}) {
  const { isAuthenticated, isReady } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const prefs = await accountNotifications.getPreferences();
    setPreferences(prefs);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPreferences(DEMO_MODE ? DEMO_NOTIFICATION_PREFERENCES : null);
      setError(DEMO_MODE ? null : "auth");
      return;
    }

    let cancelled = false;
    load().catch(() => {
      if (!cancelled) {
        setPreferences(DEMO_MODE ? DEMO_NOTIFICATION_PREFERENCES : null);
        setError(DEMO_MODE ? null : "load");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, load]);

  const handleUpdate = useCallback(
    async (input: UpdateNotificationPreferencesInput) => {
      if (!isAuthenticated) {
        setPreferences((current) => {
          if (!current) return current;
          return {
            ...current,
            channels: { ...current.channels, ...input.channels },
            quietHours: { ...current.quietHours, ...input.quietHours },
            marketingDailyCap:
              input.marketingDailyCap ?? current.marketingDailyCap,
            updatedAt: new Date().toISOString(),
          };
        });
        return;
      }

      setPending(true);
      setError(null);
      try {
        const next = await accountNotifications.updatePreferences(input);
        setPreferences(next);
      } catch {
        setError("save");
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated],
  );

  if (!preferences && error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <Typography className="text-danger" type="body">
          {error === "auth"
            ? "برای مشاهده تنظیمات وارد حساب شوید."
            : "بارگذاری تنظیمات اعلان ناموفق بود."}
        </Typography>
        {error === "load" ? (
          <Button size="lg" onPress={() => void load()} variant="secondary">
            تلاش دوباره
          </Button>
        ) : null}
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <NotificationSettingsScreen
      error={error}
      onUpdate={handleUpdate}
      pending={pending}
      preferences={preferences}
      roleSegment={roleSegment}
    />
  );
}
