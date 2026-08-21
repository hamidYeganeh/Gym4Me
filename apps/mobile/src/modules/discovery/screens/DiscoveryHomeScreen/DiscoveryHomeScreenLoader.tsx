"use client";

import { useAuth } from "@/shared/providers/AuthProvider";
import { useDiscoveryHome } from "../../lib/use-discovery-home";
import { usePlacementBanners } from "../../lib/use-placement-banners";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";

export function DiscoveryHomeScreenLoader({
  compact: compactProp,
}: { compact?: boolean } = {}) {
  const { isAuthenticated, activeRole } = useAuth();
  const compact = compactProp ?? (isAuthenticated && activeRole === "athlete");
  const home = useDiscoveryHome();
  const banners = usePlacementBanners("discovery_home");

  return (
    <DiscoveryHomeScreen
      amenities={compact ? [] : home.amenities}
      banners={banners.slides}
      cities={compact ? [] : home.cities}
      coachCityName={home.coachCityName}
      galleryItems={compact ? [] : home.galleryItems}
      sports={compact ? [] : home.sports}
    />
  );
}
