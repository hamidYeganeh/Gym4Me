"use client";

import { CoachMap } from "@repo/ui/kit/CoachMap";
import { discoveryMapCanvasSectionStyles as styles } from "./DiscoveryMapCanvasSection.styles";
import type { DiscoveryMapCanvasSectionProps } from "./DiscoveryMapCanvasSection.types";

export function DiscoveryMapCanvasSection({
  markers,
  selectedId,
  onSelect,
  zoomInLabel,
  zoomOutLabel,
  zoomLabel,
}: DiscoveryMapCanvasSectionProps) {
  return (
    <section className={styles.root}>
      <CoachMap
        markers={markers}
        onSelect={onSelect}
        selectedId={selectedId}
        zoomInLabel={zoomInLabel}
        zoomLabel={zoomLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </section>
  );
}
