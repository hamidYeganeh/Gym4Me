"use client";

import { useEffect } from "react";
import type { DevicePlatform } from "@repo/api";
import {
  hasPushPermissionBeenPrompted,
  registerDeviceToken,
} from "@/shared/lib/push";
import { roleAppPath } from "@/shared/lib/role-routes";
import { useAuth } from "./AuthProvider";
import { useRouter } from "@/shared/lib/app-router";
import { parsePushAction } from "@/shared/lib/push-action";

/**
 * Native push registration lifecycle:
 * once authenticated on a native platform, register the device token when
 * permission is already granted (prompted during onboarding), and deep-link
 * into the inbox when a notification is tapped. No-op in regular browsers.
 * Does not re-prompt if the user already saw / skipped the onboarding sheet.
 */
export function PushNotificationsProvider() {
  const { isAuthenticated, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const listenerHandles: { remove: () => Promise<void> }[] = [];

    async function setupPush() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || cancelled) return;

      const { PushNotifications } = await import(
        "@capacitor/push-notifications"
      );

      const permission = await PushNotifications.checkPermissions();
      if (permission.receive === "prompt" && hasPushPermissionBeenPrompted()) {
        return;
      }
      if (permission.receive === "prompt") {
        // Legacy path for sessions that never saw the onboarding sheet.
        const next = await PushNotifications.requestPermissions();
        if (next.receive !== "granted" || cancelled) return;
      } else if (permission.receive !== "granted" || cancelled) {
        return;
      }

      const platform = Capacitor.getPlatform() as DevicePlatform;

      listenerHandles.push(
        await PushNotifications.addListener("registration", (token) => {
          void registerDeviceToken(token.value, platform).catch(() => {
            // Retried on next app start; not fatal for the session.
          });
        }),
      );

      listenerHandles.push(
        await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          ({ notification }) => {
            const action = parsePushAction(notification.data?.action);
            router.push(action ?? roleAppPath(activeRole, "notifications"));
          },
        ),
      );

      await PushNotifications.register();
    }

    void setupPush();

    return () => {
      cancelled = true;
      for (const handle of listenerHandles) {
        void handle.remove();
      }
    };
  }, [isAuthenticated, activeRole, router]);

  return null;
}
