"use client";

import { Button, Link, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { CityCard } from "@repo/ui/cards/CityCard";
import { ClubCard, ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { DistrictCard } from "@repo/ui/cards/DistrictCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  clubsNearby,
  clubsOpenNow,
  sortClubsByRating,
  type BrowseClub,
} from "../../lib/clubs-browse-data";
import { discoveryClubsScreenStyles as styles } from "./DiscoveryClubsScreen.styles";
import type { DiscoveryClubsScreenProps } from "./DiscoveryClubsScreen.types";

function SectionRail({
  title,
  hint,
  ariaLabel,
  seeAllLabel,
  onSeeAll,
  children,
  scrollerClassName = styles.scroller,
}: {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: ReactNode;
  scrollerClassName?: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className="min-w-0 flex-1">
          <Typography className={styles.sectionTitle} type="h4" weight="bold">
            {title}
          </Typography>
          {hint ? (
            <Typography className={styles.sectionHint} type="body-xs">
              {hint}
            </Typography>
          ) : null}
        </div>
        {seeAllLabel && onSeeAll ? (
          <Link className={styles.seeAll} onPress={onSeeAll}>
            {seeAllLabel}
          </Link>
        ) : null}
      </div>
      <div aria-label={ariaLabel} className={scrollerClassName}>
        {children}
      </div>
    </section>
  );
}

function ClubRailCard({
  club,
  orientation,
  className,
  actionLabel,
  pricePrefix,
  priceSuffix,
  favoriteLabel,
  shareLabel,
  onOpen,
}: {
  club: BrowseClub;
  orientation: "horizontal" | "vertical" | "fullWidth";
  className: string;
  actionLabel: string;
  pricePrefix: string;
  priceSuffix: string;
  favoriteLabel: string;
  shareLabel: string;
  onOpen: () => void;
}) {
  return (
    <ClubCard
      actionLabel={actionLabel}
      className={className}
      favoriteLabel={favoriteLabel}
      features={club.featureLabels.map((label) => ({ label }))}
      image={club.image || PLACEHOLDER_IMAGE}
      imageAlt={club.title}
      onAction={onOpen}
      orientation={orientation}
      price={club.price}
      pricePrefix={pricePrefix}
      priceSuffix={priceSuffix}
      rating={club.rating}
      ratingCount={club.ratingCount}
      shareLabel={shareLabel}
      subtitle={club.location}
      title={club.title}
    />
  );
}

export function DiscoveryClubsScreen({
  clubs,
  discoveryFilters,
  activeFilter,
  onFilterChange,
  provinces,
  cities,
  districts,
  isLoading,
}: DiscoveryClubsScreenProps) {
  const t = useTranslations("DiscoveryClubs");
  const router = useRouter();

  const featured = sortClubsByRating(clubs).slice(0, 4);
  const nearby = clubsNearby(clubs).slice(0, 8);
  const openNow = clubsOpenNow(clubs).slice(0, 8);
  const topRated = sortClubsByRating(clubs).slice(0, 8);
  const horizontalPicks = clubs.slice(0, 6);
  const allClubs = clubs;

  const openClub = (id: string) => {
    router.push(`/discovery/clubs/${id}`);
  };

  const openLocation = (id: string) => {
    router.push(`/discovery/clubs?locationId=${encodeURIComponent(id)}`);
  };

  const cardLabels = {
    actionLabel: t("viewClub"),
    pricePrefix: t("pricePrefix"),
    priceSuffix: t("priceSuffix"),
    favoriteLabel: t("favoriteLabel"),
    shareLabel: t("shareLabel"),
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
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {discoveryFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              onPress={() => onFilterChange(filter.id)}
              selected={activeFilter === filter.id}
            >
              {filter.label}
            </FilterChip>
          ))}
        </FilterChipBar>

        <Typography className={styles.meta} type="body-sm">
          {isLoading
            ? t("loading")
            : t("resultsCount", { count: clubs.length })}
        </Typography>

        {isLoading && clubs.length === 0 ? (
          <div className={styles.stack} aria-busy="true" aria-live="polite">
            <ClubCardSkeleton orientation="fullWidth" />
            <div className="flex gap-3 overflow-hidden">
              <ClubCardSkeleton
                className={styles.clubCardVertical}
                orientation="vertical"
              />
              <ClubCardSkeleton
                className={styles.clubCardVertical}
                orientation="vertical"
              />
            </div>
            <ClubCardSkeleton orientation="horizontal" />
            <ClubCardSkeleton orientation="horizontal" />
          </div>
        ) : null}

        {featured.length > 0 ? (
          <SectionRail
            ariaLabel={t("featuredTitle")}
            hint={t("featuredHint")}
            scrollerClassName={styles.fullBleedScroller}
            title={t("featuredTitle")}
          >
            {featured.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardFullWidth}
                club={club}
                key={`featured-${club.id}`}
                onOpen={() => openClub(club.id)}
                orientation="fullWidth"
              />
            ))}
          </SectionRail>
        ) : null}

        {provinces.length > 0 ? (
          <SectionRail
            ariaLabel={t("provincesTitle")}
            hint={t("provincesHint")}
            title={t("provincesTitle")}
          >
            {provinces.map((province) => (
              <DistrictCard
                actionLabel={t("viewProvince")}
                className={styles.locationCard}
                image={province.image || PLACEHOLDER_IMAGE}
                imageAlt={province.name}
                key={province.id}
                onPress={() => openLocation(province.id)}
                size="md"
                subtitle={province.subtitle ?? t("provinceLabel")}
                title={province.name}
              />
            ))}
          </SectionRail>
        ) : null}

        {nearby.length > 0 ? (
          <SectionRail
            ariaLabel={t("nearbyTitle")}
            hint={t("nearbyHint")}
            title={t("nearbyTitle")}
          >
            {nearby.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardVertical}
                club={club}
                key={`nearby-${club.id}`}
                onOpen={() => openClub(club.id)}
                orientation="vertical"
              />
            ))}
          </SectionRail>
        ) : null}

        {cities.length > 0 ? (
          <SectionRail
            ariaLabel={t("citiesTitle")}
            hint={t("citiesHint")}
            title={t("citiesTitle")}
          >
            {cities.map((city) => (
              <CityCard
                actionLabel={t("viewCityClubs")}
                city={city.name}
                className={styles.locationCard}
                image={city.image || PLACEHOLDER_IMAGE}
                imageAlt={city.name}
                key={city.id}
                onAction={() => openLocation(city.id)}
                size="md"
              />
            ))}
          </SectionRail>
        ) : null}

        {openNow.length > 0 ? (
          <SectionRail
            ariaLabel={t("openNowTitle")}
            hint={t("openNowHint")}
            title={t("openNowTitle")}
          >
            {openNow.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardHorizontal}
                club={club}
                key={`open-${club.id}`}
                onOpen={() => openClub(club.id)}
                orientation="horizontal"
              />
            ))}
          </SectionRail>
        ) : null}

        {districts.length > 0 ? (
          <SectionRail
            ariaLabel={t("districtsTitle")}
            hint={t("districtsHint")}
            title={t("districtsTitle")}
          >
            {districts.map((district) => (
              <DistrictCard
                actionLabel={t("viewDistrict")}
                className={styles.locationCard}
                image={district.image || PLACEHOLDER_IMAGE}
                imageAlt={district.name}
                key={district.id}
                onPress={() => openLocation(district.id)}
                size="sm"
                subtitle={district.subtitle ?? t("districtLabel")}
                title={district.name}
              />
            ))}
          </SectionRail>
        ) : null}

        {topRated.length > 0 ? (
          <SectionRail
            ariaLabel={t("topRatedTitle")}
            hint={t("topRatedHint")}
            title={t("topRatedTitle")}
          >
            {topRated.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardVertical}
                club={club}
                key={`top-${club.id}`}
                onOpen={() => openClub(club.id)}
                orientation="vertical"
              />
            ))}
          </SectionRail>
        ) : null}

        {horizontalPicks.length > 0 ? (
          <SectionRail
            ariaLabel={t("picksTitle")}
            hint={t("picksHint")}
            title={t("picksTitle")}
          >
            {horizontalPicks.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardHorizontal}
                club={club}
                key={`pick-${club.id}`}
                onOpen={() => openClub(club.id)}
                orientation="horizontal"
              />
            ))}
          </SectionRail>
        ) : null}

        {allClubs.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("allClubsTitle")}
              </Typography>
            </div>
            <div className={styles.stack}>
              {allClubs.map((club, index) => {
                const orientation =
                  index % 5 === 0
                    ? "fullWidth"
                    : index % 2 === 0
                      ? "horizontal"
                      : "vertical";
                return (
                  <ClubRailCard
                    {...cardLabels}
                    className={
                      orientation === "vertical"
                        ? "w-full max-w-[300px] self-center"
                        : "w-full"
                    }
                    club={club}
                    key={`all-${club.id}`}
                    onOpen={() => openClub(club.id)}
                    orientation={orientation}
                  />
                );
              })}
            </div>
          </section>
        ) : !isLoading ? (
          <EmptyState
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.search}
            illustrationAlt=""
            layout="media"
            primaryAction={{
              label: t("viewAllClubs"),
              onPress: () => onFilterChange("all"),
            }}
            title={t("emptyTitle")}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
