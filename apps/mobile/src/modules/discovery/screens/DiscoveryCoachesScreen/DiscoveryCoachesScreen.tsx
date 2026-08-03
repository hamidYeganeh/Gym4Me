"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryCoachesAiSection } from "../../sections/DiscoveryCoachesAiSection";
import { DiscoveryCoachesExpertSection } from "../../sections/DiscoveryCoachesExpertSection";
import { DiscoveryCoachesIntroSection } from "../../sections/DiscoveryCoachesIntroSection";
import { DiscoveryCoachesNearbySection } from "../../sections/DiscoveryCoachesNearbySection";
import { DiscoveryCoachesPopularSection } from "../../sections/DiscoveryCoachesPopularSection";
import { DiscoveryCoachesRecommendSection } from "../../sections/DiscoveryCoachesRecommendSection";
import { DiscoveryCoachesSpecialtySection } from "../../sections/DiscoveryCoachesSpecialtySection";
import { discoveryCoachesScreenStyles as styles } from "./DiscoveryCoachesScreen.styles";
import type { DiscoveryCoachesScreenProps } from "./DiscoveryCoachesScreen.types";

export function DiscoveryCoachesScreen({
  specialties,
  featuredCoaches,
  popularCoaches,
  expertCoaches,
  nearbyCoaches,
}: DiscoveryCoachesScreenProps) {
  const t = useTranslations("DiscoveryCoaches");
  const router = useRouter();

  const openCoach = (coachId: string) => {
    router.push(`/discovery/coaches/${coachId}`);
  };

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <DiscoveryCoachesIntroSection
          subtitle={t("subtitle")}
          title={t("title")}
        />

        <DiscoveryCoachesSpecialtySection
          seeAllLabel={t("seeAll")}
          specialties={specialties}
          title={t("specialtyTitle")}
        />

        <DiscoveryCoachesAiSection
          actionLabel={t("aiAction")}
          title={t("aiTitle")}
        />

        <DiscoveryCoachesRecommendSection
          certifiedLabel={t("certified")}
          closeLabel={t("close")}
          coaches={featuredCoaches}
          newLabel={t("newBadge")}
          onCoachPress={openCoach}
          seeAllLabel={t("seeAll")}
          title={t("recommendTitle")}
          yoeLabel={(years) => t("yoe", { years })}
        />

        <DiscoveryCoachesPopularSection
          coaches={popularCoaches}
          onCoachPress={openCoach}
          seeAllLabel={t("seeAll")}
          title={t("popularTitle")}
          yoeLabel={(years) => t("yoe", { years })}
        />

        <DiscoveryCoachesExpertSection
          coaches={expertCoaches}
          onCoachPress={openCoach}
          seeAllLabel={t("seeAll")}
          title={t("expertTitle")}
          verifiedLabel={t("verified")}
        />

        <DiscoveryCoachesNearbySection
          coaches={nearbyCoaches}
          inPersonLabel={t("inPersonOnly")}
          onCoachPress={openCoach}
          remoteLabel={t("availableRemote")}
          seeAllLabel={t("seeAll")}
          title={t("nearbyTitle")}
        />
      </div>
    </AppLayout>
  );
}
