"use client";

import { ConnectionErrorState } from "@/shared/components/ConnectionErrorState";
import { networkOfflineOverlayVariants } from "./NetworkOfflineOverlay.styles";
import type { NetworkOfflineOverlayProps } from "./NetworkOfflineOverlay.types";

export function NetworkOfflineOverlay({
  isVisible,
  onRefresh,
}: NetworkOfflineOverlayProps) {
  const styles = networkOfflineOverlayVariants();

  if (!isVisible) return null;

  return (
    <div
      aria-live="assertive"
      aria-modal="true"
      className={styles.root()}
      role="alertdialog"
    >
      <ConnectionErrorState kind="network" onRetry={onRefresh} />
    </div>
  );
}
