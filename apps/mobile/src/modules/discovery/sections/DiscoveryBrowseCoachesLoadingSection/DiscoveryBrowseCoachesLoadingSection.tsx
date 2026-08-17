"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
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
      <ClubCardSkeleton orientation="horizontal" />
      <ClubCardSkeleton orientation="horizontal" />
    </div>
  );
}
