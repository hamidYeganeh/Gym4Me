"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { PushNotificationsProvider } from "./PushNotificationsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PushNotificationsProvider />
      {children}
    </AuthProvider>
  );
}
