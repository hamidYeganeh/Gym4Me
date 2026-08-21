"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";

import { DiscoveryHomeAmenitiesSection } from "../../sections/DiscoveryHomeAmenitiesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeCitiesSection } from "../../sections/DiscoveryHomeCitiesSection";
import { DiscoveryHomeGalleryRailSection } from "../../sections/DiscoveryHomeGalleryRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

export function DiscoveryHomeScreen({
  banners = [],
  cities,
  coachCityName,
  amenities,
  sports,
  galleryItems,
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");

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
        <DiscoveryHomeBannersSection banners={banners} />

        <DiscoveryHomeSportsSection sports={sports} />
        <DiscoveryHomeCitiesSection cities={cities} />

        <DiscoveryHomeAmenitiesSection amenities={amenities} />
        <DiscoveryHomeGalleryRailSection galleryItems={galleryItems} />
      </div>
    </AppLayout>
  );
}
