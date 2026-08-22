"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";

import { districtClubsSeeAllHref } from "../../lib/district-clubs-home";
import { DiscoveryBrowseClubsEmptySection } from "../../sections/DiscoveryBrowseClubsEmptySection";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeCitiesSection } from "../../sections/DiscoveryHomeCitiesSection";
import { DiscoveryHomeClassesSection } from "../../sections/DiscoveryHomeClassesSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryClubsScreenStyles as styles } from "./DiscoveryClubsScreen.styles";
import type { DiscoveryClubsScreenProps } from "./DiscoveryClubsScreen.types";

export function DiscoveryClubsScreen({
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
  openNowClubs = [],
  topRatedClubs = [],
  clubsLoading = false,
  clubsCount = 0,
  hideDistrictRail = false,
  onClearFilters,
  articles = [],
  articlesLoading = false,
  classes = [],
  classesLoading = false,
}: DiscoveryClubsScreenProps) {
  const tHome = useTranslations("DiscoveryHome");
  const tClubs = useTranslations("DiscoveryClubs");
  const districtTitle = districtName
    ? tHome("districtClubsTitle", { district: districtName })
    : tHome("districtClubsTitleFallback");
  const districtHint = districtName
    ? tHome("districtClubsHint", { district: districtName })
    : tHome("districtClubsHintFallback");
  const districtSeeAllHref = districtLocationId
    ? districtClubsSeeAllHref(districtLocationId)
    : undefined;

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection locationLabel={tHome("locationFallback")} />
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
            seeAllHref={null}
          />
          {hideDistrictRail ? null : (
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
          )}
          <DiscoveryHomeClubsRailSection
            ariaLabel={tHome("nearbyTitle")}
            clubs={nearbyClubs}
            hint={tHome("nearbyHint")}
            isLoading={nearbyClubsLoading}
            keyPrefix="nearby"
            title={tHome("nearbyTitle")}
            tone="surface"
          />
          <DiscoveryHomeClubsRailSection
            ariaLabel={tClubs("topRatedTitle")}
            clubs={topRatedClubs}
            hint={tClubs("topRatedHint")}
            isLoading={clubsLoading}
            keyPrefix="top"
            title={tClubs("topRatedTitle")}
            tone="warning"
          />
          <DiscoveryHomeClubsRailSection
            ariaLabel={tClubs("openNowTitle")}
            clubs={openNowClubs}
            hint={tClubs("openNowHint")}
            isLoading={clubsLoading}
            keyPrefix="open"
            orientation="horizontal"
            pattern
            title={tClubs("openNowTitle")}
            tone="accent"
          />
          {classesLoading && classes.length === 0 ? null : (
            <DiscoveryHomeClassesSection classes={classes} />
          )}
          <DiscoveryHomeArticlesSection
            articles={articles}
            isLoading={articlesLoading}
          />
        </div>
        <div className={styles.empty}>
          <DiscoveryBrowseClubsEmptySection
            clubsCount={clubsCount}
            isLoading={clubsLoading}
            onViewAll={() => onClearFilters?.()}
          />
        </div>
      </div>
    </AppLayout>
  );
}
