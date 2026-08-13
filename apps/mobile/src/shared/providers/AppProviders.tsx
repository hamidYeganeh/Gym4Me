"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { AuthProvider } from "./AuthProvider";
import { AppConfigProvider } from "./AppConfigProvider";
import { NextMediaImageAdapter } from "./NextMediaImageAdapter";
import { PushNotificationsProvider } from "./PushNotificationsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MediaImageProvider adapter={NextMediaImageAdapter}>
      <AppConfigProvider>
        <AuthProvider>
          <PushNotificationsProvider />
          {children}
        </AuthProvider>
      </AppConfigProvider>
    </MediaImageProvider>
  );
}
