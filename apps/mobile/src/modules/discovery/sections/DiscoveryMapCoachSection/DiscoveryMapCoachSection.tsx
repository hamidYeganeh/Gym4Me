"use client";

import { CoachMapCard } from "@repo/ui/cards/CoachMapCard";
import { discoveryMapCoachSectionStyles as styles } from "./DiscoveryMapCoachSection.styles";
import type { DiscoveryMapCoachSectionProps } from "./DiscoveryMapCoachSection.types";

export function DiscoveryMapCoachSection({
  coach,
  getDirectionsLabel,
  viewDetailsLabel,
  verifiedLabel,
  onGetDirections,
  onViewDetails,
}: DiscoveryMapCoachSectionProps) {
  return (
    <section className={styles.root}>
      <CoachMapCard
        address={coach.address}
        className={styles.card}
        distanceLabel={coach.distanceLabel}
        getDirectionsLabel={getDirectionsLabel}
        image={coach.image}
        imageAlt={coach.name}
        onGetDirections={onGetDirections}
        onViewDetails={onViewDetails}
        rating={coach.rating}
        ratingCount={coach.ratingCount}
        specialtyLabel={coach.specialtyLabel}
        title={coach.name}
        verified={coach.verified}
        verifiedLabel={verifiedLabel}
        viewDetailsLabel={viewDetailsLabel}
      />
    </section>
  );
}
