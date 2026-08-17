"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
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
      <ClubCardSkeleton orientation="horizontal" />
      <ClubCardSkeleton orientation="horizontal" />
    </div>
  );
}
