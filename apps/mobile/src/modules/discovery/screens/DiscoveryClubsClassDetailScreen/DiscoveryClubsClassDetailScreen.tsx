"use client";

import { DiscoveryClubsClassDetailActionsSection } from "../../sections/DiscoveryClubsClassDetailActionsSection";
import { DiscoveryClubsClassDetailBodySection } from "../../sections/DiscoveryClubsClassDetailBodySection";
import { DiscoveryClubsClassDetailHeroSection } from "../../sections/DiscoveryClubsClassDetailHeroSection";
import { discoveryClubsClassDetailScreenStyles as styles } from "./DiscoveryClubsClassDetailScreen.styles";
import type { DiscoveryClubsClassDetailScreenProps } from "./DiscoveryClubsClassDetailScreen.types";

export function DiscoveryClubsClassDetailScreen({
  classDetail,
}: DiscoveryClubsClassDetailScreenProps) {
  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryClubsClassDetailHeroSection classDetail={classDetail} />
        <DiscoveryClubsClassDetailBodySection classDetail={classDetail} />
      </div>
      <DiscoveryClubsClassDetailActionsSection />
    </div>
  );
}
