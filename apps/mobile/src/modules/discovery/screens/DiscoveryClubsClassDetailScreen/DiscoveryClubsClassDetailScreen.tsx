"use client";

import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { DiscoveryClubsClassDetailActionsSection } from "../../sections/DiscoveryClubsClassDetailActionsSection";
import { DiscoveryClubsClassDetailBodySection } from "../../sections/DiscoveryClubsClassDetailBodySection";
import { DiscoveryClubsClassDetailHeroSection } from "../../sections/DiscoveryClubsClassDetailHeroSection";
import { discoveryClubsClassDetailScreenStyles as styles } from "./DiscoveryClubsClassDetailScreen.styles";
import type { DiscoveryClubsClassDetailScreenProps } from "./DiscoveryClubsClassDetailScreen.types";
import { useRouter } from "@/shared/lib/app-router";

export function DiscoveryClubsClassDetailScreen({
  classDetail,
}: DiscoveryClubsClassDetailScreenProps) {
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();
  const reserveHref = `/discovery/clubs/${classDetail.clubId}/reserve`;

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryClubsClassDetailHeroSection classDetail={classDetail}>
          <DiscoveryClubsClassDetailBodySection classDetail={classDetail} />
        </DiscoveryClubsClassDetailHeroSection>
      </div>
      <DiscoveryClubsClassDetailActionsSection
        classDetail={classDetail}
        onBook={() =>
          runWithAuth(() => router.push(reserveHref), reserveHref)
        }
      />
    </div>
  );
}
