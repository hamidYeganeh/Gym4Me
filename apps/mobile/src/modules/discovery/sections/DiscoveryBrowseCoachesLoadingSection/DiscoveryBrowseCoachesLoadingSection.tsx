"use client";

import { CityCardSkeleton } from "@repo/ui/cards/CityCard";
import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { DistrictCardSkeleton } from "@repo/ui/cards/DistrictCard";
import { discoveryBrowseCoachesLoadingSectionVariants } from "./DiscoveryBrowseCoachesLoadingSection.styles";
import type { DiscoveryBrowseCoachesLoadingSectionProps } from "./DiscoveryBrowseCoachesLoadingSection.types";

export function DiscoveryBrowseCoachesLoadingSection({
  isLoading,
  coachesCount,
}: DiscoveryBrowseCoachesLoadingSectionProps) {
  const slots = discoveryBrowseCoachesLoadingSectionVariants();

  if (!isLoading || coachesCount > 0) return null;

  return (
    <div aria-busy="true" aria-live="polite" className={slots.stack()}>
      <ClubCardSkeleton orientation="fullWidth" />
      <div className="flex gap-3 overflow-hidden">
        <ClubCardSkeleton
          className={slots.coachCardVertical()}
          orientation="vertical"
        />
        <ClubCardSkeleton
          className={slots.coachCardVertical()}
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
      </div>
    </div>
  );
}
