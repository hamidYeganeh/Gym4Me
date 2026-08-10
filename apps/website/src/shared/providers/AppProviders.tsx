"use client";

import type { ReactNode } from "react";
import { MediaImageProvider } from "@repo/ui/common/MediaImage";
import { NextMediaImageAdapter } from "./NextMediaImageAdapter";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MediaImageProvider adapter={NextMediaImageAdapter}>
      {children}
    </MediaImageProvider>
  );
}
