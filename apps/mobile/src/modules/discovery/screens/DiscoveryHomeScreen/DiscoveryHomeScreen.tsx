"use client";

import { Spinner } from "@heroui/react/spinner";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryHomeAmenitiesSection } from "../../sections/DiscoveryHomeAmenitiesSection";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeCitiesSection } from "../../sections/DiscoveryHomeCitiesSection";
import { DiscoveryHomeClassesSection } from "../../sections/DiscoveryHomeClassesSection";
import { DiscoveryHomeCloseCtaSection } from "../../sections/DiscoveryHomeCloseCtaSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeCoachesSection } from "../../sections/DiscoveryHomeCoachesSection";
import { DiscoveryHomeEquipmentSection } from "../../sections/DiscoveryHomeEquipmentSection";
import { DiscoveryHomeFeaturesSection } from "../../sections/DiscoveryHomeFeaturesSection";
import { DiscoveryHomeGalleryRailSection } from "../../sections/DiscoveryHomeGalleryRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeHeroSection } from "../../sections/DiscoveryHomeHeroSection";
import { DiscoveryHomeMapCtaSection } from "../../sections/DiscoveryHomeMapCtaSection";
import { DiscoveryHomeQuickNavSection } from "../../sections/DiscoveryHomeQuickNavSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

const HERO_FALLBACK_IMAGE = "/demo/coach-portrait.png";

export function DiscoveryHomeScreen({
  banners = [],
  features,
  cities,
  nearbyClubs,
  topClubs,
  open24Clubs,
  coaches,
  coachCityName,
  classes,
  amenities,
  equipment,
  sports,
  articles,
  galleryItems,
  isLoading,
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection
          citiesFallbackName={cities[0]?.name}
          coachCityName={coachCityName}
          locationLabel={t("locationFallback")}
        />
      }
    >
      <div className={styles.content}>
        <DiscoveryHomeHeroSection
          ctaLabel={t("heroCta")}
          eyebrow={t("heroEyebrow")}
          image={banners[0]?.imageUrl ?? HERO_FALLBACK_IMAGE}
          imageAlt={banners[0]?.alt ?? ""}
          subtitle={t("subtitle")}
          title={t("title")}
          onCta={() => router.push("/discovery/classes")}
        />

        <DiscoveryHomeQuickNavSection />

        <DiscoveryHomeBannersSection banners={banners} />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : null}

        <DiscoveryHomeSportsSection sports={sports} />
        <DiscoveryHomeFeaturesSection features={features} />
        <DiscoveryHomeCitiesSection cities={cities} />

        <DiscoveryHomeClubsRailSection
          ariaLabel={t("nearbyTitle")}
          clubs={nearbyClubs}
          hint={t("nearbyHint")}
          keyPrefix="nearby"
          seeAllHref="/discovery/clubs"
          title={t("nearbyTitle")}
        />
        <DiscoveryHomeClubsRailSection
          ariaLabel={t("topClubsTitle")}
          clubs={topClubs}
          hint={t("topClubsHint")}
          keyPrefix="top"
          seeAllHref="/discovery/clubs"
          title={t("topClubsTitle")}
        />

        <DiscoveryHomeCoachesSection
          coachCityName={coachCityName}
          coaches={coaches}
        />

        <DiscoveryHomeMapCtaSection
          ctaLabel={t("mapCta")}
          eyebrow={t("mapEyebrow")}
          subtitle={t("mapSubtitle")}
          title={t("mapTitle")}
          onPress={() => router.push("/discovery/map")}
        />

        <DiscoveryHomeClubsRailSection
          ariaLabel={t("open24Title")}
          clubs={open24Clubs}
          hint={t("open24Hint")}
          keyPrefix="open24"
          orientation="horizontal"
          seeAllHref="/discovery/clubs?amenitySlug=24h"
          title={t("open24Title")}
        />

        <DiscoveryHomeClassesSection classes={classes} />
        <DiscoveryHomeEquipmentSection equipment={equipment} />
        <DiscoveryHomeAmenitiesSection amenities={amenities} />
        <DiscoveryHomeArticlesSection articles={articles} />
        <DiscoveryHomeGalleryRailSection galleryItems={galleryItems} />

        <DiscoveryHomeCloseCtaSection
          actionLabel={t("closeCta")}
          subtitle={t("closeSubtitle")}
          title={t("closeTitle")}
          onAction={() => router.push("/discovery/classes")}
        />
      </div>
    </AppLayout>
  );
}
