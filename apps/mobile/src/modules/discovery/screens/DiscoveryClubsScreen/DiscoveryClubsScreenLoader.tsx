"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { useSearchParams } from "next/navigation";
import { useDiscoveryClubsBrowse } from "../../lib/use-discovery-clubs-browse";
import { DiscoveryClubsScreen } from "./DiscoveryClubsScreen";

function DiscoveryClubsPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-4 px-screen py-6"
      role="status"
    >
      <ClubCardSkeleton orientation="fullWidth" />
      <div className="flex gap-3 overflow-hidden">
        <ClubCardSkeleton className="w-[min(17.5rem,78vw)] shrink-0" orientation="vertical" />
        <ClubCardSkeleton className="w-[min(17.5rem,78vw)] shrink-0" orientation="vertical" />
      </div>
      <ClubCardSkeleton orientation="horizontal" />
      <ClubCardSkeleton orientation="horizontal" />
    </div>
  );
}

export function DiscoveryClubsScreenLoader() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get("locationId");
  const sportId = searchParams.get("sportId");
  const browse = useDiscoveryClubsBrowse({ locationId, sportId });

  if (browse.isLoading && browse.clubs.length === 0) {
    return <DiscoveryClubsPageSkeleton />;
  }

  return (
    <DiscoveryClubsScreen
      activeFilter={browse.activeFilter}
      cities={browse.cities}
      clubs={browse.clubs}
      discoveryFilters={browse.filters}
      districts={browse.districts}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      provinces={browse.provinces}
    />
  );
}
