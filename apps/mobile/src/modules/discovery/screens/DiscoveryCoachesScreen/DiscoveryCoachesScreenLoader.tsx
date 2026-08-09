"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { useSearchParams } from "next/navigation";
import { useDiscoveryCoachesBrowse } from "../../lib/use-discovery-coaches-browse";
import { DiscoveryCoachesScreen } from "./DiscoveryCoachesScreen";

function DiscoveryCoachesPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-4 px-screen py-6"
      role="status"
    >
      <ClubCardSkeleton orientation="fullWidth" />
      <div className="flex gap-3 overflow-hidden">
        <ClubCardSkeleton
          className="w-[min(17.5rem,78vw)] shrink-0"
          orientation="vertical"
        />
        <ClubCardSkeleton
          className="w-[min(17.5rem,78vw)] shrink-0"
          orientation="vertical"
        />
      </div>
      <ClubCardSkeleton orientation="horizontal" />
      <ClubCardSkeleton orientation="horizontal" />
    </div>
  );
}

export function DiscoveryCoachesScreenLoader() {
  const searchParams = useSearchParams();
  const browse = useDiscoveryCoachesBrowse({
    specialtyKey: searchParams.get("specialtyKey"),
    cityId: searchParams.get("cityId"),
    availability: searchParams.get("availability"),
    verified: searchParams.get("verified"),
    fresh: searchParams.get("fresh"),
  });

  if (browse.isLoading && browse.coaches.length === 0) {
    return <DiscoveryCoachesPageSkeleton />;
  }

  return (
    <DiscoveryCoachesScreen
      activeFilter={browse.activeFilter}
      cities={browse.cities}
      coaches={browse.coaches}
      discoveryFilters={browse.filters}
      districts={browse.districts}
      isLoading={browse.isLoading}
      onFilterChange={browse.setActiveFilter}
      provinces={browse.provinces}
    />
  );
}
