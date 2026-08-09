"use client";

import { Button, Link, Spinner, Typography } from "@heroui/react";
import { BabyFace1 } from "@repo/icons/BabyFace1";
import { Building2 } from "@repo/icons/Building2";
import { Car1 } from "@repo/icons/Car1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Coffee } from "@repo/icons/Coffee";
import { Crown1 } from "@repo/icons/Crown1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { Lock1 } from "@repo/icons/Lock1";
import { MapTrifold } from "@repo/icons/MapTrifold";
import { Moon } from "@repo/icons/Moon";
import { Shower1 } from "@repo/icons/Shower1";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Wheelchair } from "@repo/icons/Wheelchair";
import { WifiFull } from "@repo/icons/WifiFull";
import { AchievementTag } from "@repo/ui/cards/AchievementTag";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { CityCard } from "@repo/ui/cards/CityCard";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { ClubGalleryCard } from "@repo/ui/cards/ClubGalleryCard";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import type {
  HomeAmenityItem,
  HomeFeatureItem,
} from "../../lib/home-browse-data";
import {
  HOME_SPORT_COLORS,
  discoveryHomeScreenStyles as styles,
} from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

const QUICK_NAV_ICON_SIZE = 22;
const FEATURE_ICON_SIZE = 20;
const AMENITY_ICON_SIZE = 36;

function SectionRail({
  title,
  hint,
  ariaLabel,
  seeAllLabel,
  onSeeAll,
  children,
}: {
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: ReactNode;
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
      <div aria-label={ariaLabel} className={styles.scroller}>
        {children}
      </div>
    </section>
  );
}

function featureIcon(iconKey: HomeFeatureItem["iconKey"]) {
  switch (iconKey) {
    case "female":
      return <GenderFemale size={FEATURE_ICON_SIZE} />;
    case "male":
      return <GenderMale size={FEATURE_ICON_SIZE} />;
    case "parking":
      return <Car1 size={FEATURE_ICON_SIZE} />;
    case "accessible":
      return <Wheelchair size={FEATURE_ICON_SIZE} />;
    case "kids":
      return <BabyFace1 size={FEATURE_ICON_SIZE} />;
    case "adults":
      return <UsersTwo size={FEATURE_ICON_SIZE} />;
    case "premium":
      return <Crown1 size={FEATURE_ICON_SIZE} />;
    case "open24":
      return <Moon size={FEATURE_ICON_SIZE} />;
  }
}

function amenityIcon(iconKey: HomeAmenityItem["iconKey"]) {
  switch (iconKey) {
    case "parking":
      return <Car1 size={AMENITY_ICON_SIZE} />;
    case "shower":
      return <Shower1 size={AMENITY_ICON_SIZE} />;
    case "locker":
      return <Lock1 size={AMENITY_ICON_SIZE} />;
    case "sauna":
      return <Moon size={AMENITY_ICON_SIZE} />;
    case "wifi":
      return <WifiFull size={AMENITY_ICON_SIZE} />;
    case "cafe":
      return <Coffee size={AMENITY_ICON_SIZE} />;
    case "open24":
      return <Moon size={AMENITY_ICON_SIZE} />;
  }
}

function ClubRailCard({
  club,
  orientation,
  className,
  actionLabel,
  favoriteLabel,
  shareLabel,
  onOpen,
}: {
  club: BrowseClub;
  orientation: "horizontal" | "vertical";
  className: string;
  actionLabel: string;
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
      rating={club.rating}
      ratingCount={club.ratingCount}
      shareLabel={shareLabel}
      subtitle={club.location}
      title={club.title}
    />
  );
}

export function DiscoveryHomeScreen({
  features,
  cities,
  nearbyClubs,
  topClubs,
  open24Clubs,
  coaches,
  coachCityName,
  classes,
  amenities,
  sports,
  articles,
  galleryItems,
  isLoading,
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();

  const openClub = (id: string) => {
    router.push(`/discovery/clubs/${id}`);
  };

  const cardLabels = {
    actionLabel: t("viewClub"),
    favoriteLabel: t("favoriteLabel"),
    shareLabel: t("shareLabel"),
  };

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
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

        {features.length > 0 ? (
          <SectionRail
            ariaLabel={t("featuresTitle")}
            title={t("featuresTitle")}
          >
            {features.map((feature) => (
              <Button
                aria-label={feature.title}
                className={styles.featureSlide}
                key={feature.id}
                variant="ghost"
                onPress={() => router.push(feature.href)}
              >
                <AchievementTag
                  color={feature.color}
                  icon={featureIcon(feature.iconKey)}
                />
                <Typography className={styles.featureLabel} type="body-xs">
                  {feature.title}
                </Typography>
              </Button>
            ))}
          </SectionRail>
        ) : null}

        {cities.length > 0 ? (
          <SectionRail
            ariaLabel={t("citiesTitle")}
            hint={t("citiesHint")}
            seeAllLabel={t("seeAll")}
            title={t("citiesTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
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
          </SectionRail>
        ) : null}

        {nearbyClubs.length > 0 ? (
          <SectionRail
            ariaLabel={t("nearbyTitle")}
            hint={t("nearbyHint")}
            seeAllLabel={t("seeAll")}
            title={t("nearbyTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {nearbyClubs.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardVertical}
                club={club}
                key={`nearby-${club.id}`}
                orientation="vertical"
                onOpen={() => openClub(club.id)}
              />
            ))}
          </SectionRail>
        ) : null}

        {topClubs.length > 0 ? (
          <SectionRail
            ariaLabel={t("topClubsTitle")}
            hint={t("topClubsHint")}
            seeAllLabel={t("seeAll")}
            title={t("topClubsTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {topClubs.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardVertical}
                club={club}
                key={`top-${club.id}`}
                orientation="vertical"
                onOpen={() => openClub(club.id)}
              />
            ))}
          </SectionRail>
        ) : null}

        {coaches.length > 0 ? (
          <SectionRail
            ariaLabel={t("coachesTitle", { city: coachCityName })}
            hint={t("coachesHint", { city: coachCityName })}
            seeAllLabel={t("seeAll")}
            title={t("coachesTitle", { city: coachCityName })}
            onSeeAll={() => router.push("/discovery/coaches")}
          >
            {coaches.map((coach) => (
              <CoachFeatureCard
                certifiedLabel={
                  coach.isCertified ? t("certifiedLabel") : undefined
                }
                className={styles.coachCard}
                experienceLabel={t("yoe", { years: coach.yearsExperience })}
                image={coach.image || PLACEHOLDER_IMAGE}
                imageAlt={coach.name}
                isNew={coach.isNew}
                key={coach.id}
                newLabel={t("newLabel")}
                rating={coach.rating}
                ratingCount={coach.ratingCount}
                specialty={coach.specialty}
                title={coach.name}
                onPress={() => router.push(`/discovery/coaches/${coach.id}`)}
              />
            ))}
          </SectionRail>
        ) : null}

        {open24Clubs.length > 0 ? (
          <SectionRail
            ariaLabel={t("open24Title")}
            hint={t("open24Hint")}
            seeAllLabel={t("seeAll")}
            title={t("open24Title")}
            onSeeAll={() =>
              router.push("/discovery/clubs?amenitySlug=24h")
            }
          >
            {open24Clubs.map((club) => (
              <ClubRailCard
                {...cardLabels}
                className={styles.clubCardHorizontal}
                club={club}
                key={`open24-${club.id}`}
                orientation="horizontal"
                onOpen={() => openClub(club.id)}
              />
            ))}
          </SectionRail>
        ) : null}

        {classes.length > 0 ? (
          <SectionRail
            ariaLabel={t("classesTitle")}
            hint={t("classesHint")}
            seeAllLabel={t("seeAll")}
            title={t("classesTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {classes.map((item) => {
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
                  size="md"
                  title={item.title}
                  onAction={() => router.push(href)}
                />
              );
            })}
          </SectionRail>
        ) : null}

        {amenities.length > 0 ? (
          <SectionRail
            ariaLabel={t("amenitiesTitle")}
            hint={t("amenitiesHint")}
            title={t("amenitiesTitle")}
          >
            {amenities.map((amenity) => (
              <Button
                aria-label={amenity.name}
                className={styles.amenityCard}
                key={amenity.id}
                variant="ghost"
                onPress={() =>
                  router.push(
                    `/discovery/clubs?amenitySlug=${encodeURIComponent(amenity.slug)}`,
                  )
                }
              >
                <ClubAmenityCard
                  className="w-full"
                  icon={amenityIcon(amenity.iconKey)}
                  subtitle={amenity.subtitle}
                  title={amenity.name}
                />
              </Button>
            ))}
          </SectionRail>
        ) : null}

        {sports.length > 0 ? (
          <SectionRail
            ariaLabel={t("sportsTitle")}
            hint={t("sportsHint")}
            seeAllLabel={t("seeAll")}
            title={t("sportsTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {sports.map((sport, index) => (
              <SportCard
                actionLabel={t("viewSport")}
                className={styles.sportCard}
                color={HOME_SPORT_COLORS[index % HOME_SPORT_COLORS.length]}
                key={sport.id}
                size="sm"
                sport={{
                  title: sport.name,
                  subtitle: sport.description ?? t("sportLabel"),
                  backgroundImage: sport.image,
                }}
                onPress={() =>
                  router.push(
                    `/discovery/clubs?sportId=${encodeURIComponent(sport.id)}`,
                  )
                }
              />
            ))}
          </SectionRail>
        ) : null}

        {articles.length > 0 ? (
          <SectionRail
            ariaLabel={t("articlesTitle")}
            hint={t("articlesHint")}
            seeAllLabel={t("seeAll")}
            title={t("articlesTitle")}
            onSeeAll={() => router.push("/articles")}
          >
            {articles.map((article) => (
              <ArticleCard
                actionLabel={t("viewArticle")}
                author={{
                  name: article.authorName,
                  avatarSrc: article.authorAvatarSrc,
                }}
                category={article.category}
                className={styles.articleCard}
                coverSrc={article.coverSrc ?? PLACEHOLDER_IMAGE}
                key={article.id}
                likesLabel={article.likesLabel}
                publishedAtLabel={article.publishedAtLabel}
                readingTimeLabel={t("readingTime", {
                  minutes: article.readingTimeMinutes,
                })}
                title={article.title}
                variant="stacked"
                viewsLabel={article.viewsLabel}
                onPress={() =>
                  router.push(
                    `/articles/detail?slug=${encodeURIComponent(article.slug)}`,
                  )
                }
              />
            ))}
          </SectionRail>
        ) : null}

        {galleryItems.length > 0 ? (
          <SectionRail
            ariaLabel={t("galleryTitle")}
            hint={t("galleryHint")}
            seeAllLabel={t("seeAll")}
            title={t("galleryTitle")}
            onSeeAll={() => router.push("/discovery/clubs")}
          >
            {galleryItems.map((item) => (
              <ClubGalleryCard
                actionLabel={t("viewGallery")}
                author={item.author}
                className={styles.galleryCard}
                image={item.image || PLACEHOLDER_IMAGE}
                imageAlt={item.title}
                key={item.id}
                mediaKind="image"
                title={item.title}
                viewsLabel={item.viewsLabel}
                onPress={() => openClub(item.clubId)}
              />
            ))}
          </SectionRail>
        ) : null}
      </div>
    </AppLayout>
  );
}
