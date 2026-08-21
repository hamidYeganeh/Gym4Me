"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { Toaster } from "@repo/ui/kit/Toast";
import { AuthProvider } from "./AuthProvider";
import { AppConfigProvider } from "./AppConfigProvider";
import { DevicePermissionsProvider } from "./DevicePermissionsProvider";
import { ExitAppProvider } from "./ExitAppProvider";
import { NextMediaImageAdapter } from "./NextMediaImageAdapter";
import { PushNotificationsProvider } from "./PushNotificationsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MediaImageProvider adapter={NextMediaImageAdapter}>
      <AppConfigProvider>
        <AuthProvider>
          <Toaster placement="top">
            <DevicePermissionsProvider>
              <PushNotificationsProvider />
              <ExitAppProvider />
              {children}
            </DevicePermissionsProvider>
          </Toaster>
        </AuthProvider>
      </AppConfigProvider>
    </MediaImageProvider>
  );
}
