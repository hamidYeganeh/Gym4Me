"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Fire1 } from "@repo/icons/Fire1";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
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
  isEmpty,
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

        {isEmpty ? (
          <EmptyState
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.search}
            illustrationAlt=""
            layout="media"
            primaryAction={{
              label: t("exploreClubs"),
              onPress: () => router.push("/discovery/clubs"),
            }}
            suggestions={[
              {
                key: "hiit",
                label: t("suggestionHiit"),
                icon: <Fire1 size={16} />,
                onPress: () => router.push("/discovery/coaches"),
              },
              {
                key: "yoga",
                label: t("suggestionYoga"),
                onPress: () => router.push("/discovery/coaches"),
              },
              {
                key: "pilates",
                label: t("suggestionPilates"),
                onPress: () => router.push("/discovery/coaches"),
              },
            ]}
            suggestionsLabel={t("suggestionsLabel")}
            title={t("emptyTitle")}
          />
        ) : (
          <>
            <DiscoveryCoachesSpecialtySection
              seeAllLabel={t("seeAll")}
              specialties={specialties}
              title={t("specialtyTitle")}
            />

            <DiscoveryCoachesAiSection
              actionLabel={t("aiAction")}
              title={t("aiTitle")}
            />

            {featuredCoaches.length > 0 ? (
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
            ) : null}

            {popularCoaches.length > 0 ? (
              <DiscoveryCoachesPopularSection
                coaches={popularCoaches}
                onCoachPress={openCoach}
                seeAllLabel={t("seeAll")}
                title={t("popularTitle")}
                yoeLabel={(years) => t("yoe", { years })}
              />
            ) : null}

            {expertCoaches.length > 0 ? (
              <DiscoveryCoachesExpertSection
                coaches={expertCoaches}
                onCoachPress={openCoach}
                seeAllLabel={t("seeAll")}
                title={t("expertTitle")}
                verifiedLabel={t("verified")}
              />
            ) : null}

            {nearbyCoaches.length > 0 ? (
              <DiscoveryCoachesNearbySection
                coaches={nearbyCoaches}
                inPersonLabel={t("inPersonOnly")}
                onCoachPress={openCoach}
                remoteLabel={t("availableRemote")}
                seeAllLabel={t("seeAll")}
                title={t("nearbyTitle")}
              />
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}
