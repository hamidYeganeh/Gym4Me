"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { Toaster } from "@repo/ui/kit/Toast";
import { apiClient } from "@/shared/lib/api";
import { ApiToastBridge } from "./ApiToastBridge";
import { NextMediaImageAdapter } from "./NextMediaImageAdapter";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MediaImageProvider adapter={NextMediaImageAdapter}>
      <Toaster>
        <ApiToastBridge client={apiClient} />
        {children}
      </Toaster>
    </MediaImageProvider>
  );
}
