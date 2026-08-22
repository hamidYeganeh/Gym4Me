"use client";

import { usePlacementBanners } from "../../lib/use-placement-banners";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";

export function DiscoveryHomeScreenLoader() {
  const banners = usePlacementBanners("discovery_home");

  return <DiscoveryHomeScreen banners={banners.slides} />;
}
