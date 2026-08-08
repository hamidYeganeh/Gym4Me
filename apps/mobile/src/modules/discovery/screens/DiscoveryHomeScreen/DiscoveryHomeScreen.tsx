"use client";

import { Button, Link, Spinner, Typography } from "@heroui/react";
import { Building2 } from "@repo/icons/Building2";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MapTrifold } from "@repo/icons/MapTrifold";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { CityCard } from "@repo/ui/cards/CityCard";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { CoachPopularItem } from "@repo/ui/cards/CoachPopularItem";
import { DistrictCard } from "@repo/ui/cards/DistrictCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { SportCategoryCard } from "@repo/ui/cards/SportCategoryCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import {
  HOME_SPORT_COLORS,
  discoveryHomeScreenStyles as styles,
} from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

const QUICK_NAV_ICON_SIZE = 22;

export function DiscoveryHomeScreen({
  provinces,
  cities,
  sportCategories,
  sports,
  featuredClubs,
  popularCoaches,
  featuredClasses,
  isLoading,
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();

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

        <nav aria-label={t("quickNavLabel")} className={styles.quickNav}>
          <QuickActionCard
            icon={<MapTrifold size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickMap")}
            onPress={() => router.push("/discovery/map")}
          />
          <QuickActionCard
            icon={<Building2 size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickClubs")}
            onPress={() => router.push("/discovery/clubs")}
          />
          <QuickActionCard
            icon={<UsersTwo size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickCoaches")}
            onPress={() => router.push("/discovery/coaches")}
          />
        </nav>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : null}

        {provinces.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("provincesTitle")}
              </Typography>
            </div>
            <div className={styles.scroller}>
              {provinces.map((province) => (
                <DistrictCard
                  actionLabel={t("viewProvince")}
                  className={styles.provinceCard}
                  image={province.image || PLACEHOLDER_IMAGE}
                  imageAlt={province.name}
                  key={province.id}
                  onPress={() =>
                    router.push(
                      `/discovery/clubs?locationId=${encodeURIComponent(province.id)}`,
                    )
                  }
                  size="md"
                  subtitle={province.subtitle ?? t("provinceLabel")}
                  title={province.name}
                />
              ))}
            </div>
          </section>
        ) : null}

        {cities.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("citiesTitle")}
              </Typography>
            </div>
            <div className={styles.scroller}>
              {cities.map((city) => (
                <CityCard
                  actionLabel={t("viewCityClubs")}
                  city={city.name}
                  className={styles.cityCard}
                  image={city.image || PLACEHOLDER_IMAGE}
                  imageAlt={city.name}
                  key={city.id}
                  onAction={() =>
                    router.push(
                      `/discovery/clubs?locationId=${encodeURIComponent(city.id)}`,
                    )
                  }
                  size="md"
                />
              ))}
            </div>
          </section>
        ) : null}

        {sportCategories.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("sportCategoriesTitle")}
              </Typography>
            </div>
            <div className={styles.scroller}>
              {sportCategories.map((category, index) => (
                <SportCategoryCard
                  actionLabel={t("viewSportCategory")}
                  category={{
                    title: category.name,
                    subtitle: t("categoryLabel"),
                    backgroundImage: category.image,
                  }}
                  className={styles.sportCategoryCard}
                  color={HOME_SPORT_COLORS[index % HOME_SPORT_COLORS.length]}
                  key={category.id}
                  onPress={() =>
                    router.push(
                      `/discovery/clubs?sportId=${encodeURIComponent(category.id)}`,
                    )
                  }
                  size="sm"
                />
              ))}
            </div>
          </section>
        ) : null}

        {sports.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("sportsTitle")}
              </Typography>
            </div>
            <div className={styles.scroller}>
              {sports.map((sport, index) => (
                <SportCard
                  actionLabel={t("viewSport")}
                  className={styles.sportCard}
                  color={HOME_SPORT_COLORS[index % HOME_SPORT_COLORS.length]}
                  key={sport.id}
                  onPress={() =>
                    router.push(
                      `/discovery/clubs?sportId=${encodeURIComponent(sport.id)}`,
                    )
                  }
                  size="sm"
                  sport={{
                    title: sport.name,
                    subtitle: sport.description ?? t("sportLabel"),
                    backgroundImage: sport.image,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography className={styles.sectionTitle} type="h4" weight="bold">
              {t("clubsTitle")}
            </Typography>
            <Link
              className={styles.seeAll}
              onPress={() => router.push("/discovery/clubs")}
            >
              {t("seeAll")}
            </Link>
          </div>
          {featuredClubs.length > 0 ? (
            <div className={styles.scroller}>
              {featuredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  actionLabel={t("viewClub")}
                  className={styles.clubCard}
                  favoriteLabel={t("favoriteLabel")}
                  image={club.image}
                  imageAlt={club.title}
                  onAction={() => router.push(`/discovery/clubs/${club.id}`)}
                  orientation="horizontal"
                  rating={club.rating}
                  ratingCount={club.ratingCount}
                  shareLabel={t("shareLabel")}
                  subtitle={club.location}
                  title={club.title}
                />
              ))}
            </div>
          ) : (
            <Typography className={styles.emptyInline} type="body-sm">
              {t("emptyClubs")}
            </Typography>
          )}
        </section>

        {featuredClasses.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography className={styles.sectionTitle} type="h4" weight="bold">
                {t("classesTitle")}
              </Typography>
              <Link
                className={styles.seeAll}
                onPress={() => router.push("/discovery/clubs")}
              >
                {t("seeAll")}
              </Link>
            </div>
            <div className={styles.scroller}>
              {featuredClasses.map((item) => {
                const href = `/discovery/clubs/${item.clubId}/classes/${item.id}`;
                return (
                  <ClubClassCard
                    actionLabel={t("viewClass")}
                    author={item.author}
                    backgroundImage={item.backgroundImage}
                    backgroundImageAlt={item.title}
                    category={item.category}
                    className={styles.classCard}
                    date={item.date}
                    duration={item.duration}
                    key={`${item.clubId}-${item.id}`}
                    onAction={() => router.push(href)}
                    size="md"
                    title={item.title}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography className={styles.sectionTitle} type="h4" weight="bold">
              {t("coachesTitle")}
            </Typography>
            <Link
              className={styles.seeAll}
              onPress={() => router.push("/discovery/coaches")}
            >
              {t("seeAll")}
            </Link>
          </div>
          {popularCoaches.length > 0 ? (
            <div className={styles.coachList}>
              {popularCoaches.map((coach, index) => (
                <Fragment key={coach.id}>
                  <CoachPopularItem
                    experienceLabel={t("yoe", { years: coach.yearsExperience })}
                    image={coach.image}
                    imageAlt={coach.name}
                    onPress={() =>
                      router.push(`/discovery/coaches/${coach.id}`)
                    }
                    rank={index + 1}
                    rating={coach.rating}
                    ratingCount={coach.ratingCount}
                    title={coach.name}
                  />
                  <div aria-hidden className={styles.coachDivider} />
                </Fragment>
              ))}
            </div>
          ) : (
            <Typography className={styles.emptyInline} type="body-sm">
              {t("emptyCoaches")}
            </Typography>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
