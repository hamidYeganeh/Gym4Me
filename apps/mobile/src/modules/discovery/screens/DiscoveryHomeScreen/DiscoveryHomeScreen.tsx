"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";

import { districtClubsSeeAllHref } from "../../lib/district-clubs-home";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeCitiesSection } from "../../sections/DiscoveryHomeCitiesSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

export function DiscoveryHomeScreen({
  banners = [],
  bannersLoading = false,
  categories = [],
  categoriesLoading = false,
  sportCategories = [],
  sportCategoriesLoading = false,
  sports = [],
  sportsLoading = false,
  cities = [],
  citiesLoading = false,
  nearbyClubs = [],
  nearbyClubsLoading = false,
  districtClubs = [],
  districtClubsLoading = false,
  districtName = null,
  districtLocationId = null,
  articles = [],
  articlesLoading = false,
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");
  const districtTitle = districtName
    ? t("districtClubsTitle", { district: districtName })
    : t("districtClubsTitleFallback");
  const districtHint = districtName
    ? t("districtClubsHint", { district: districtName })
    : t("districtClubsHintFallback");
  const districtSeeAllHref = districtLocationId
    ? districtClubsSeeAllHref(districtLocationId)
    : "/discovery/clubs";

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection locationLabel={t("locationFallback")} />
      }
    >
      <div className={styles.content}>
        <div className={styles.banners}>
          <DiscoveryHomeBannersSection
            banners={banners}
            isLoading={bannersLoading}
          />
        </div>
        <div className={styles.sheets}>
          <DiscoveryHomeClubCategoriesSection
            categories={categories}
            isLoading={categoriesLoading}
          />
          <DiscoveryHomeSportCategoriesSection
            categories={sportCategories}
            isLoading={sportCategoriesLoading}
          />
          <DiscoveryHomeSportsSection
            isLoading={sportsLoading}
            sports={sports}
          />
          <DiscoveryHomeCitiesSection
            cities={cities}
            isLoading={citiesLoading}
          />
          <DiscoveryHomeClubsRailSection
            ariaLabel={districtTitle}
            clubs={districtClubs}
            hint={districtHint}
            isLoading={districtClubsLoading}
            keyPrefix="district"
            pattern
            seeAllHref={districtSeeAllHref}
            title={districtTitle}
            tone="warning"
          />
          <DiscoveryHomeClubsRailSection
            ariaLabel={t("nearbyTitle")}
            clubs={nearbyClubs}
            hint={t("nearbyHint")}
            isLoading={nearbyClubsLoading}
            keyPrefix="nearby"
            seeAllHref="/discovery/clubs"
            title={t("nearbyTitle")}
            tone="surface"
          />
          <DiscoveryHomeArticlesSection
            articles={articles}
            isLoading={articlesLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
