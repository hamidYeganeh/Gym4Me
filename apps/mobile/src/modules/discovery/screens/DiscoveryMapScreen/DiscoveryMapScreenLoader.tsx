"use client";

import { Spinner } from "@heroui/react/spinner";
import { useDiscoveryMapPins } from "../../lib/use-discovery-map-pins";
import { DiscoveryMapScreen } from "./DiscoveryMapScreen";

export function DiscoveryMapScreenLoader() {
  const map = useDiscoveryMapPins();

  if (map.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DiscoveryMapScreen
      coaches={map.coaches}
      initialSelectedId={map.initialSelectedId}
      nearestId={map.nearestId}
    />
  );
}
