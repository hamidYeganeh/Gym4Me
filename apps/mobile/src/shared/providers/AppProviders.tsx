"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { Toaster } from "@repo/ui/kit/Toast";
import { PageTransition } from "@/shared/components/PageTransition";
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
              <PageTransition>
                <ExitAppProvider />
                {children}
              </PageTransition>
            </DevicePermissionsProvider>
          </Toaster>
        </AuthProvider>
      </AppConfigProvider>
    </MediaImageProvider>
  );
}
