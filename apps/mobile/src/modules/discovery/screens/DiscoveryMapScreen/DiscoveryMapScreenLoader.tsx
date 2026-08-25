"use client";

import { useDiscoveryMapPins } from "../../lib/use-discovery-map-pins";
import { DiscoveryMapScreen } from "./DiscoveryMapScreen";

export function DiscoveryMapScreenLoader() {
  const map = useDiscoveryMapPins();

  return (
    <DiscoveryMapScreen
      coaches={map.coaches}
      initialSelectedId={map.initialSelectedId}
      isError={map.isError}
      isLoading={map.isLoading}
      nearestId={map.nearestId}
      onRetry={map.retry}
    />
  );
}
