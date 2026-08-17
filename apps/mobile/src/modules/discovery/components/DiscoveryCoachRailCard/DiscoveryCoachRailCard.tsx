"use client";

import { ClubCard } from "@repo/ui/cards/ClubCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { DiscoveryCoachRailCardProps } from "./DiscoveryCoachRailCard.types";

export function DiscoveryCoachRailCard({
  coach,
  orientation,
  className,
  actionLabel,
  pricePrefix,
  priceSuffix,
  favoriteLabel,
  shareLabel,
  onOpen,
}: DiscoveryCoachRailCardProps) {
  return (
    <ClubCard
      actionLabel={actionLabel}
      className={className}
      favoriteLabel={favoriteLabel}
      features={coach.featureLabels.map((label) => ({ label }))}
      image={coach.image || PLACEHOLDER_IMAGE}
      imageAlt={coach.title}
      imageClassName="object-top"
      onAction={onOpen}
      orientation={orientation}
      price={coach.price}
      pricePrefix={pricePrefix}
      priceSuffix={priceSuffix}
      rating={coach.rating}
      ratingCount={coach.ratingCount}
      shareLabel={shareLabel}
      subtitle={coach.location}
      title={coach.title}
    />
  );
}
