"use client";

import { CityCardSkeleton } from "@repo/ui/cards/CityCard";
import { ClubAmenityCardSkeleton } from "@repo/ui/cards/ClubAmenityCard";
import { ClubGalleryCardSkeleton } from "@repo/ui/cards/ClubGalleryCard";
import { SportCardSkeleton } from "@repo/ui/cards/SportCard";
import { BannerCarouselSkeleton } from "@repo/ui/kit/BannerCarousel";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useAuth } from "@/shared/providers/AuthProvider";
import { useDiscoveryHome } from "../../lib/use-discovery-home";
import { usePlacementBanners } from "../../lib/use-placement-banners";
import { discoveryHomeCitiesSectionVariants } from "../../sections/DiscoveryHomeCitiesSection/DiscoveryHomeCitiesSection.styles";
import { discoveryHomeGalleryRailSectionVariants } from "../../sections/DiscoveryHomeGalleryRailSection/DiscoveryHomeGalleryRailSection.styles";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { discoveryHomeSportsSectionVariants } from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";
import { DiscoverySectionRail } from "../../sections/DiscoverySectionRail";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";

function times(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

function DiscoveryHomePageSkeleton({ compact }: { compact: boolean }) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const sportSlots = discoveryHomeSportsSectionVariants();
  const citySlots = discoveryHomeCitiesSectionVariants();
  const gallerySlots = discoveryHomeGalleryRailSectionVariants();

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection locationLabel={t("locationFallback")} />
      }
    >
      <div
        aria-busy="true"
        aria-live="polite"
        className={styles.content}
        role="status"
      >
        <BannerCarouselSkeleton aspectRatio="16/9" radius="surface" />

        {compact ? null : (
          <DiscoverySectionRail
            ariaLabel={t("sportsTitle")}
            hint={t("sportsHint")}
            scrollerClassName={sportSlots.scroller()}
            seeAllLabel={t("seeAll")}
            title={t("sportsTitle")}
            onSeeAll={() => router.push("/discovery/sports")}
          >
            {times(5).map((index) => (
              <SportCardSkeleton
                className={
                  index === 0 ? sportSlots.cardFeatured() : sportSlots.card()
                }
                key={index}
                size="sm"
              />
            ))}
          </DiscoverySectionRail>
        )}

        {compact ? null : (
          <DiscoverySectionRail
            ariaLabel={t("citiesTitle")}
            hint={t("citiesHint")}
            seeAllLabel={t("seeAll")}
            title={t("citiesTitle")}
            onSeeAll={() => router.push("/discovery/sports")}
          >
            {times(4).map((index) => (
              <CityCardSkeleton
                className={citySlots.card()}
                key={index}
                size="md"
              />
            ))}
          </DiscoverySectionRail>
        )}

        {compact ? null : (
          <>
            <DiscoverySectionRail
              ariaLabel={t("amenitiesTitle")}
              hint={t("amenitiesHint")}
              title={t("amenitiesTitle")}
            >
              {times(3).map((index) => (
                <ClubAmenityCardSkeleton
                  className="shrink-0 snap-start"
                  key={index}
                />
              ))}
            </DiscoverySectionRail>

            <DiscoverySectionRail
              ariaLabel={t("galleryTitle")}
              hint={t("galleryHint")}
              seeAllLabel={t("seeAll")}
              title={t("galleryTitle")}
              onSeeAll={() => router.push("/discovery/sports")}
            >
              {times(4).map((index) => (
                <ClubGalleryCardSkeleton
                  className={gallerySlots.card()}
                  key={index}
                />
              ))}
            </DiscoverySectionRail>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export function DiscoveryHomeScreenLoader({
  compact: compactProp,
}: { compact?: boolean } = {}) {
  const { isAuthenticated, activeRole } = useAuth();
  const compact = compactProp ?? (isAuthenticated && activeRole === "athlete");
  const home = useDiscoveryHome();
  const banners = usePlacementBanners("discovery_home");

  if (home.isLoading && home.sports.length === 0 && home.cities.length === 0) {
    return <DiscoveryHomePageSkeleton compact={compact} />;
  }

  return (
    <DiscoveryHomeScreen
      amenities={compact ? [] : home.amenities}
      banners={banners.slides}
      cities={compact ? [] : home.cities}
      coachCityName={home.coachCityName}
      galleryItems={compact ? [] : home.galleryItems}
      sports={compact ? [] : home.sports}
    />
  );
}
