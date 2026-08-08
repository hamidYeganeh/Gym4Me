"use client";

import { useState } from "react";
import { DiscoveryClubsDetailActionsSection } from "../../sections/DiscoveryClubsDetailActionsSection";
import { DiscoveryClubsDetailBodySection } from "../../sections/DiscoveryClubsDetailBodySection";
import { DiscoveryClubsDetailHeroSection } from "../../sections/DiscoveryClubsDetailHeroSection";
import { discoveryClubsDetailScreenStyles as styles } from "./DiscoveryClubsDetailScreen.styles";
import type { DiscoveryClubsDetailScreenProps } from "./DiscoveryClubsDetailScreen.types";

function getClubRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return undefined;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function DiscoveryClubsDetailScreen({
  club,
}: DiscoveryClubsDetailScreenProps) {
  const defaultPlanId =
    club.subscriptions.find((plan) => plan.price > 0)?.id ??
    club.subscriptions[0]?.id ??
    "";
  const [selectedSubscriptionId, setSelectedSubscriptionId] =
    useState(defaultPlanId);

  const selectedPlan =
    club.subscriptions.find((plan) => plan.id === selectedSubscriptionId) ??
    club.subscriptions[0];
  const rating = getClubRating(club.reviews);

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryClubsDetailHeroSection
          gallery={club.gallery}
          images={club.images}
          isFavorite={club.isFavorite}
          isOpen={club.isOpen}
          location={club.location}
          openHoursLabel={club.openHoursLabel}
          rating={rating}
          reviewCount={club.reviews.length}
          title={club.title}
        >
          <DiscoveryClubsDetailBodySection
            club={club}
            onSubscriptionChange={setSelectedSubscriptionId}
            selectedSubscriptionId={selectedSubscriptionId}
          />
        </DiscoveryClubsDetailHeroSection>
      </div>
      <DiscoveryClubsDetailActionsSection
        price={selectedPlan?.price ?? 0}
        pricePrefix={club.pricePrefix}
        priceSuffix={club.priceSuffix}
      />
    </div>
  );
}
