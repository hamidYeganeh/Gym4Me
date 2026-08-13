"use client";

import { Spinner } from "@heroui/react";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountNotifications } from "@/shared/lib/api";
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

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setPreferences(DEMO_NOTIFICATION_PREFERENCES);
      return;
    }

    let cancelled = false;
    accountNotifications
      .getPreferences()
      .then((prefs) => {
        if (!cancelled) setPreferences(prefs);
      })
      .catch(() => {
        if (!cancelled) setPreferences(DEMO_NOTIFICATION_PREFERENCES);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

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
