"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { districtClubsSeeAllHref } from "../../lib/district-clubs-home";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import { DiscoveryBrowseClubsEmptySection } from "../../sections/DiscoveryBrowseClubsEmptySection";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryPopularLocationsSection } from "../../sections/DiscoveryPopularLocationsSection";
import { DiscoveryHomeClassesSection } from "../../sections/DiscoveryHomeClassesSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsColumnSection } from "../../sections/DiscoveryHomeClubsColumnSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryClubsScreenStyles as styles } from "./DiscoveryClubsScreen.styles";
import type { DiscoveryClubsScreenProps } from "./DiscoveryClubsScreen.types";

function uniqueListingClubs(groups: BrowseClub[][]) {
  const seen = new Set<string>();
  const clubs: BrowseClub[] = [];

  for (const group of groups) {
    for (const club of group) {
      if (seen.has(club.id)) continue;
      seen.add(club.id);
      clubs.push(club);
    }
  }

  return clubs.slice(0, 6);
}

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
  clubsError = false,
  clubsCount = 0,
  hideDistrictRail = false,
  onClearFilters,
  onClubsRetry,
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
  const listingClubs = useMemo(
    () =>
      uniqueListingClubs([
        districtClubs,
        nearbyClubs,
        topRatedClubs,
        openNowClubs,
      ]),
    [districtClubs, nearbyClubs, openNowClubs, topRatedClubs],
  );

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
          <DiscoveryPopularLocationsSection
            isLoading={citiesLoading}
            kind="city"
            locations={cities}
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
          {clubsError ? (
            <EmptyState
              description={tClubs("errorBody")}
              illustration={EMPTY_STATE_ILLUSTRATIONS.warning}
              illustrationAlt=""
              layout="media"
              primaryAction={
                onClubsRetry
                  ? { label: tClubs("retry"), onPress: onClubsRetry }
                  : undefined
              }
              status="danger"
              title={tClubs("errorTitle")}
            />
          ) : (
            <>
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
            </>
          )}
          {classesLoading && classes.length === 0 ? null : (
            <DiscoveryHomeClassesSection classes={classes} />
          )}
          <DiscoveryHomeArticlesSection
            articles={articles}
            isLoading={articlesLoading}
          />
          {listingClubs.length > 0 ? (
            <DiscoveryHomeClubsColumnSection
              ariaLabel={tHome("listingClubsTitle")}
              clubs={listingClubs}
              hint={tHome("listingClubsHint")}
              keyPrefix="listing"
              title={tHome("listingClubsTitle")}
              tone="surface"
            />
          ) : null}
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
