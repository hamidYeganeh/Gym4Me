"use client";

import { CityCardSkeleton } from "@repo/ui/cards/CityCard";
import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { DistrictCardSkeleton } from "@repo/ui/cards/DistrictCard";
import { discoveryBrowseClubsLoadingSectionVariants } from "./DiscoveryBrowseClubsLoadingSection.styles";
import type { DiscoveryBrowseClubsLoadingSectionProps } from "./DiscoveryBrowseClubsLoadingSection.types";

export function DiscoveryBrowseClubsLoadingSection({
  isLoading,
  clubsCount,
}: DiscoveryBrowseClubsLoadingSectionProps) {
  const slots = discoveryBrowseClubsLoadingSectionVariants();

  if (!isLoading || clubsCount > 0) return null;

  return (
    <div aria-busy="true" aria-live="polite" className={slots.stack()}>
      <ClubCardSkeleton orientation="fullWidth" />
      <div className="flex gap-3 overflow-hidden">
        <ClubCardSkeleton
          className={slots.clubCardVertical()}
          orientation="vertical"
        />
        <ClubCardSkeleton
          className={slots.clubCardVertical()}
          orientation="vertical"
        />
      </div>
      <div className="flex gap-3 overflow-hidden">
        <CityCardSkeleton className="shrink-0" size="md" />
        <CityCardSkeleton className="shrink-0" size="md" />
        <CityCardSkeleton className="shrink-0" size="md" />
      </div>
      <ClubCardSkeleton orientation="horizontal" />
      <div className="flex gap-3 overflow-hidden">
        <DistrictCardSkeleton className="shrink-0" size="md" />
        <DistrictCardSkeleton className="shrink-0" size="md" />
        <DistrictCardSkeleton className="shrink-0" size="md" />
      </div>
    </div>
  );
}
