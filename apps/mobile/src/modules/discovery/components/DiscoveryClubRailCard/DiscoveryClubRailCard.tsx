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
  statusOpenLabel,
  statusClosedLabel,
  favoriteLabel,
  shareLabel,
  onOpen,
}: DiscoveryClubRailCardProps) {
  const isListing = orientation === "listing";

  return (
    <ClubCard
      actionLabel={isListing ? undefined : actionLabel}
      className={className}
      favoriteLabel={favoriteLabel}
      features={club.featureLabels.map((label) => ({ label }))}
      image={club.image || PLACEHOLDER_IMAGE}
      imageAlt={club.title}
      onAction={onOpen}
      onShare={onOpen}
      orientation={orientation}
      price={
        isListing || pricePrefix || priceSuffix ? club.price : undefined
      }
      pricePrefix={!isListing ? pricePrefix : undefined}
      priceSuffix={priceSuffix ?? club.priceSuffix}
      rating={club.rating}
      ratingCount={club.ratingCount}
      shareLabel={shareLabel}
      statusLabel={
        isListing
          ? club.openState === "open"
            ? statusOpenLabel
            : statusClosedLabel
          : undefined
      }
      subtitle={club.location}
      title={club.title}
    />
  );
}
