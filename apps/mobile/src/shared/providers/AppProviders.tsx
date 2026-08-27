"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { Toaster } from "@repo/ui/kit/Toast";
import { apiClient } from "@/shared/lib/api-client";
import { ApiToastBridge } from "./ApiToastBridge";
import { ApiNavigationBridge } from "./ApiNavigationBridge";
import { AuthProvider } from "./AuthProvider";
import { AppConfigProvider } from "./AppConfigProvider";
import { DevicePermissionsProvider } from "./DevicePermissionsProvider";
import { ExitAppProvider } from "./ExitAppProvider";
import { NetworkOfflineProvider } from "./NetworkOfflineProvider";
import { NextMediaImageAdapter } from "./NextMediaImageAdapter";
import { PushNotificationsProvider } from "./PushNotificationsProvider";
import { PaymentReturnProvider } from "./PaymentReturnProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MediaImageProvider adapter={NextMediaImageAdapter}>
      <AppConfigProvider>
        <AuthProvider>
          <Toaster placement="top">
            <ApiToastBridge client={apiClient} />
            <ApiNavigationBridge />
            <DevicePermissionsProvider>
              <PushNotificationsProvider />
              <PaymentReturnProvider />
              <ExitAppProvider />
              <NetworkOfflineProvider>{children}</NetworkOfflineProvider>
            </DevicePermissionsProvider>
          </Toaster>
        </AuthProvider>
      </AppConfigProvider>
    </MediaImageProvider>
  );
}
