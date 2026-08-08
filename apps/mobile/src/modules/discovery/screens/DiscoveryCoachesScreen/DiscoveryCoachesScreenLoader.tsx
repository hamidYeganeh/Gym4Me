"use client";

import { CoachExpertCardSkeleton } from "@repo/ui/cards/CoachExpertCard";
import { CoachNearbyCardSkeleton } from "@repo/ui/cards/CoachNearbyCard";
import { useDiscoveryCoachesBrowse } from "../../lib/use-discovery-coaches-browse";
import { DiscoveryCoachesScreen } from "./DiscoveryCoachesScreen";

function DiscoveryCoachesPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-6 px-screen py-6"
      role="status"
    >
      <div className="flex gap-3 overflow-hidden">
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
        <CoachExpertCardSkeleton className="shrink-0" />
      </div>
      <CoachNearbyCardSkeleton />
      <CoachNearbyCardSkeleton />
      <CoachNearbyCardSkeleton />
    </div>
  );
}

export function DiscoveryCoachesScreenLoader() {
  const browse = useDiscoveryCoachesBrowse();

  if (browse.isLoading) {
    return <DiscoveryCoachesPageSkeleton />;
  }

  return (
    <DiscoveryCoachesScreen
      expertCoaches={browse.expertCoaches}
      featuredCoaches={browse.featuredCoaches}
      isEmpty={browse.isEmpty}
      nearbyCoaches={browse.nearbyCoaches}
      popularCoaches={browse.popularCoaches}
      specialties={browse.specialties}
    />
  );
}
