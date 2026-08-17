"use client";

import { ClubCard } from "@repo/ui/cards/ClubCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { DiscoveryClubRailCardProps } from "./DiscoveryClubRailCard.types";

export function DiscoveryClubRailCard({
  club,
  orientation,
  className,
  actionLabel,
  pricePrefix,
  priceSuffix,
  favoriteLabel,
  shareLabel,
  onOpen,
}: DiscoveryClubRailCardProps) {
  return (
    <ClubCard
      actionLabel={actionLabel}
      className={className}
      favoriteLabel={favoriteLabel}
      features={club.featureLabels.map((label) => ({ label }))}
      image={club.image || PLACEHOLDER_IMAGE}
      imageAlt={club.title}
      onAction={onOpen}
      orientation={orientation}
      price={pricePrefix || priceSuffix ? club.price : undefined}
      pricePrefix={pricePrefix}
      priceSuffix={priceSuffix}
      rating={club.rating}
      ratingCount={club.ratingCount}
      shareLabel={shareLabel}
      subtitle={club.location}
      title={club.title}
    />
  );
}
