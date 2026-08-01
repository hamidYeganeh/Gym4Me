"use client";

import { DiscoveryClubsDetailHeroSection } from "../../sections/DiscoveryClubsDetailHeroSection";
import { discoveryClubsDetailScreenStyles as styles } from "./DiscoveryClubsDetailScreen.styles";
import type { DiscoveryClubsDetailScreenProps } from "./DiscoveryClubsDetailScreen.types";

export function DiscoveryClubsDetailScreen({
  club,
}: DiscoveryClubsDetailScreenProps) {
  return (
    <div className={styles.root}>
      <DiscoveryClubsDetailHeroSection
        images={club.images}
        isFavorite={club.isFavorite}
        location={club.location}
        title={club.title}
      />
    </div>
  );
}
