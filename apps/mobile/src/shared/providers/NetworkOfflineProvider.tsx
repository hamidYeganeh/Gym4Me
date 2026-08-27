"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { NetworkOfflineOverlay } from "@/shared/components/NetworkOfflineOverlay";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";

export function NetworkOfflineProvider({ children }: { children: ReactNode }) {

  return (
    <>
      {children}
    </>
  );
}
