"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { AchievementTagSkeleton } from "@repo/ui/cards/AchievementTag";
import { ArticleCardSkeleton } from "@repo/ui/cards/ArticleCard";
import { CityCardSkeleton } from "@repo/ui/cards/CityCard";
import { ClubAmenityCardSkeleton } from "@repo/ui/cards/ClubAmenityCard";
import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { ClubClassCardSkeleton } from "@repo/ui/cards/ClubClassCard";
import { ClubGalleryCardSkeleton } from "@repo/ui/cards/ClubGalleryCard";
import { CoachFeatureCardSkeleton } from "@repo/ui/cards/CoachFeatureCard";
import { EquipmentBrowseCardSkeleton } from "@repo/ui/cards/EquipmentBrowseCard";
import { SportCardSkeleton } from "@repo/ui/cards/SportCard";
import { BannerCarouselSkeleton } from "@repo/ui/kit/BannerCarousel";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useDiscoveryHome } from "../../lib/use-discovery-home";
import { usePlacementBanners } from "../../lib/use-placement-banners";
import { DiscoveryHomeCloseCtaSection } from "../../sections/DiscoveryHomeCloseCtaSection";
import { discoveryHomeArticlesSectionVariants } from "../../sections/DiscoveryHomeArticlesSection/DiscoveryHomeArticlesSection.styles";
import { discoveryHomeCitiesSectionVariants } from "../../sections/DiscoveryHomeCitiesSection/DiscoveryHomeCitiesSection.styles";
import { discoveryHomeClassesSectionVariants } from "../../sections/DiscoveryHomeClassesSection/DiscoveryHomeClassesSection.styles";
import { discoveryHomeClubsRailSectionVariants } from "../../sections/DiscoveryHomeClubsRailSection/DiscoveryHomeClubsRailSection.styles";
import { discoveryHomeCoachesSectionVariants } from "../../sections/DiscoveryHomeCoachesSection/DiscoveryHomeCoachesSection.styles";
import { discoveryHomeEquipmentSectionVariants } from "../../sections/DiscoveryHomeEquipmentSection/DiscoveryHomeEquipmentSection.styles";
import { discoveryHomeFeaturesSectionVariants } from "../../sections/DiscoveryHomeFeaturesSection/DiscoveryHomeFeaturesSection.styles";
import { discoveryHomeGalleryRailSectionVariants } from "../../sections/DiscoveryHomeGalleryRailSection/DiscoveryHomeGalleryRailSection.styles";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { discoveryHomeHeroSectionVariants } from "../../sections/DiscoveryHomeHeroSection/DiscoveryHomeHeroSection.styles";
import { DiscoveryHomeMapCtaSection } from "../../sections/DiscoveryHomeMapCtaSection";
import { DiscoveryHomeQuickNavSection } from "../../sections/DiscoveryHomeQuickNavSection";
import { discoveryHomeSportsSectionVariants } from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";
import { DiscoverySectionRail } from "../../sections/DiscoverySectionRail";
import { DiscoveryHomeScreen } from "./DiscoveryHomeScreen";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";

function times(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

function DiscoveryHomeHeroSkeleton() {
  const slots = discoveryHomeHeroSectionVariants();

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={slots.root()}
      role="status"
    >
      <Skeleton aria-hidden className="absolute inset-0 rounded-[inherit]" />
      <div className={slots.content()}>
        <div className={slots.copy()}>
          <Skeleton
            aria-hidden
            className="relative z-10 h-3.5 w-24 rounded-md"
          />
          <Skeleton
            aria-hidden
            className="relative z-10 h-10 w-56 rounded-lg"
          />
          <Skeleton aria-hidden className="relative z-10 h-4 w-40 rounded-md" />
        </div>
        <Skeleton aria-hidden className="relative z-10 h-12 w-32 rounded-2xl" />
      </div>
    </section>
  );
}

function DiscoveryHomePageSkeleton({ compact }: { compact: boolean }) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const sportSlots = discoveryHomeSportsSectionVariants();
  const featureSlots = discoveryHomeFeaturesSectionVariants();
  const citySlots = discoveryHomeCitiesSectionVariants();
  const clubSlots = discoveryHomeClubsRailSectionVariants();
  const coachSlots = discoveryHomeCoachesSectionVariants();
  const classSlots = discoveryHomeClassesSectionVariants();
  const equipmentSlots = discoveryHomeEquipmentSectionVariants();
  const articleSlots = discoveryHomeArticlesSectionVariants();
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
        <DiscoveryHomeHeroSkeleton />
        <DiscoveryHomeQuickNavSection />
        <BannerCarouselSkeleton />

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

        <DiscoverySectionRail
          ariaLabel={t("featuresTitle")}
          title={t("featuresTitle")}
        >
          {times(6).map((index) => (
            <div className={featureSlots.slide()} key={index}>
              <AchievementTagSkeleton />
              <Skeleton aria-hidden className="h-3 w-12 rounded-md" />
            </div>
          ))}
        </DiscoverySectionRail>

        {compact ? null : (
          <DiscoverySectionRail
            ariaLabel={t("citiesTitle")}
            hint={t("citiesHint")}
            seeAllLabel={t("seeAll")}
            title={t("citiesTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
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

        <DiscoverySectionRail
          ariaLabel={t("nearbyTitle")}
          hint={t("nearbyHint")}
          seeAllLabel={t("seeAll")}
          title={t("nearbyTitle")}
          onSeeAll={() => router.push("/discovery/clubs")}
        >
          {times(3).map((index) => (
            <ClubCardSkeleton
              className={clubSlots.cardVertical()}
              key={index}
              orientation="vertical"
            />
          ))}
        </DiscoverySectionRail>

        {compact ? null : (
          <DiscoverySectionRail
            ariaLabel={t("topClubsTitle")}
            hint={t("topClubsHint")}
            seeAllLabel={t("seeAll")}
            title={t("topClubsTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {times(3).map((index) => (
              <ClubCardSkeleton
                className={clubSlots.cardVertical()}
                key={index}
                orientation="vertical"
              />
            ))}
          </DiscoverySectionRail>
        )}

        <DiscoverySectionRail
          ariaLabel={t("coachesTitle", { city: t("locationFallback") })}
          hint={t("coachesHint", { city: t("locationFallback") })}
          seeAllLabel={t("seeAll")}
          title={t("coachesTitle", { city: t("locationFallback") })}
          onSeeAll={() => router.push("/discovery/coaches")}
        >
          {times(4).map((index) => (
            <CoachFeatureCardSkeleton
              className={coachSlots.card()}
              key={index}
            />
          ))}
        </DiscoverySectionRail>

        <DiscoveryHomeMapCtaSection
          ctaLabel={t("mapCta")}
          eyebrow={t("mapEyebrow")}
          subtitle={t("mapSubtitle")}
          title={t("mapTitle")}
          onPress={() => router.push("/discovery/map")}
        />

        {compact ? null : (
          <DiscoverySectionRail
            ariaLabel={t("open24Title")}
            hint={t("open24Hint")}
            seeAllLabel={t("seeAll")}
            title={t("open24Title")}
            onSeeAll={() => router.push("/discovery/clubs?amenitySlug=24h")}
          >
            {times(2).map((index) => (
              <ClubCardSkeleton
                className={clubSlots.cardHorizontal()}
                key={index}
                orientation="horizontal"
              />
            ))}
          </DiscoverySectionRail>
        )}

        <DiscoverySectionRail
          ariaLabel={t("classesTitle")}
          hint={t("classesHint")}
          seeAllLabel={t("seeAll")}
          title={t("classesTitle")}
          onSeeAll={() => router.push("/discovery/classes")}
        >
          {times(3).map((index) => (
            <ClubClassCardSkeleton
              className={classSlots.card()}
              key={index}
              size="md"
            />
          ))}
        </DiscoverySectionRail>

        <DiscoverySectionRail
          ariaLabel={t("equipmentTitle")}
          scrollerClassName={equipmentSlots.grid()}
          seeAllLabel={t("seeAll")}
          title={t("equipmentTitle")}
          onSeeAll={() => router.push("/discovery/clubs")}
        >
          <EquipmentBrowseCardSkeleton size="lg" />
          <EquipmentBrowseCardSkeleton size="md" />
          <EquipmentBrowseCardSkeleton size="md" />
          <EquipmentBrowseCardSkeleton size="sm" />
          <EquipmentBrowseCardSkeleton size="sm" />
        </DiscoverySectionRail>

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
              ariaLabel={t("articlesTitle")}
              hint={t("articlesHint")}
              seeAllLabel={t("seeAll")}
              title={t("articlesTitle")}
              onSeeAll={() => router.push("/articles")}
            >
              {times(2).map((index) => (
                <ArticleCardSkeleton
                  className={articleSlots.card()}
                  key={index}
                  orientation="vertical"
                  type="cover"
                />
              ))}
            </DiscoverySectionRail>

            <DiscoverySectionRail
              ariaLabel={t("galleryTitle")}
              hint={t("galleryHint")}
              seeAllLabel={t("seeAll")}
              title={t("galleryTitle")}
              onSeeAll={() => router.push("/discovery/clubs")}
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

export function DiscoveryHomeScreenLoader({
  compact: compactProp,
}: { compact?: boolean } = {}) {
  const { isAuthenticated, activeRole } = useAuth();
  const compact = compactProp ?? (isAuthenticated && activeRole === "athlete");
  const home = useDiscoveryHome();
  const banners = usePlacementBanners("discovery_home");

  if (
    home.isLoading &&
    home.nearbyClubs.length === 0 &&
    home.topClubs.length === 0
  ) {
    return <DiscoveryHomePageSkeleton compact={compact} />;
  }

  return (
    <DiscoveryHomeScreen
      amenities={compact ? [] : home.amenities}
      articles={compact ? [] : home.articles}
      banners={banners.slides}
      cities={compact ? [] : home.cities}
      classes={home.classes}
      coachCityName={home.coachCityName}
      coaches={home.coaches}
      equipment={home.equipment}
      features={home.features}
      galleryItems={compact ? [] : home.galleryItems}
      nearbyClubs={home.nearbyClubs}
      open24Clubs={compact ? [] : home.open24Clubs}
      sports={compact ? [] : home.sports}
      topClubs={compact ? [] : home.topClubs}
    />
  );
}
