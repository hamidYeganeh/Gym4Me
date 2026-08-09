"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DevicePlatform } from "@repo/api";
import { registerDeviceToken } from "@/shared/lib/push";
import { roleAppPath } from "@/shared/lib/role-routes";
import { useAuth } from "./AuthProvider";

/**
 * Native push registration lifecycle:
 * once authenticated on a native platform, request permission, register the
 * device token with the API, and deep-link into the inbox when a
 * notification is tapped. No-op in regular browsers.
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

      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === "prompt") {
        permission = await PushNotifications.requestPermissions();
      }
      if (permission.receive !== "granted" || cancelled) return;

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
          () => {
            router.push(roleAppPath(activeRole, "notifications"));
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
