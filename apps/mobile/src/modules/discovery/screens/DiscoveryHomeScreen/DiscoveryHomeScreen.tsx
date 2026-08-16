"use client";

import { Button, Link, Spinner, Typography } from "@heroui/react";
import { BabyFace1 } from "@repo/icons/BabyFace1";
import { Building2 } from "@repo/icons/Building2";
import { Car1 } from "@repo/icons/Car1";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { Coffee } from "@repo/icons/Coffee";
import { Crown1 } from "@repo/icons/Crown1";
import { Funnel1 } from "@repo/icons/Funnel1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { Lock1 } from "@repo/icons/Lock1";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
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
import { EquipmentBrowseCard } from "@repo/ui/cards/EquipmentBrowseCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { BannerCarousel } from "@repo/ui/kit/BannerCarousel";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { PublicUser } from "@repo/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  DISCOVERY_MOCK_ADDRESSES,
  formatAddressLine,
  type DiscoveryAddressItem,
} from "../../lib/discovery-addresses-data";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import type {
  HomeAmenityItem,
  HomeFeatureItem,
} from "../../lib/home-browse-data";
import { DiscoveryHomeCloseCtaSection } from "../../sections/DiscoveryHomeCloseCtaSection";
import { DiscoveryHomeHeroSection } from "../../sections/DiscoveryHomeHeroSection";
import { DiscoveryHomeMapCtaSection } from "../../sections/DiscoveryHomeMapCtaSection";
import { DiscoveryLocationSheet } from "../../sections/DiscoveryLocationSheet";
import {
  HOME_SPORT_THEMES,
  discoveryHomeScreenStyles as styles,
} from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

const HERO_FALLBACK_IMAGE = "/demo/coach-portrait.png";

function profileAddressItem(
  user: PublicUser | null,
  label: string,
): DiscoveryAddressItem | null {
  if (!user) return null;
  const line = formatAddressLine(user.address);
  if (!line) return null;
  return {
    id: "profile",
    label,
    line,
    city: user.address.city?.trim() || label,
  };
}

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
        <div className={styles.sectionTitleRow}>
          <span aria-hidden className={styles.sectionAccent} />
          <div className="min-w-0 flex-1">
            <Typography className={styles.sectionTitle} type="h3" weight="bold">
              {title}
            </Typography>
            {hint ? (
              <Typography className={styles.sectionHint} type="body-xs">
                {hint}
              </Typography>
            ) : null}
          </div>
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
  const { user, isAuthenticated } = useAuth();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const profile = profileAddressItem(user, t("locationProfileLabel"));
  const addresses = profile
    ? [
        profile,
        ...DISCOVERY_MOCK_ADDRESSES.filter((item) => item.id !== "home"),
      ]
    : DISCOVERY_MOCK_ADDRESSES;

  const selectedAddress =
    addresses.find((item) => item.id === selectedAddressId) ??
    addresses[0] ??
    null;

  const locationLabel =
    selectedAddress?.city ||
    selectedAddress?.label ||
    coachCityName ||
    cities[0]?.name ||
    t("locationFallback");

  const openClub = (id: string) => {
    router.push(`/discovery/clubs/${id}`);
  };

  const cardLabels = {
    actionLabel: t("viewClub"),
    favoriteLabel: t("favoriteLabel"),
    shareLabel: t("shareLabel"),
  };

  const openBannerLink = (
    linkKind: "none" | "internal" | "external",
    linkUrl: string | null,
  ) => {
    if (!linkUrl) return;
    if (linkKind === "internal") {
      router.push(linkUrl);
    } else if (linkKind === "external") {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AppLayout
      className={styles.root}
      header={
        <>
          <div aria-hidden className={styles.headerSpacer} />
          <header className={styles.header}>
            <div className={styles.headerBar}>
              <Button
                aria-label={t("filterAria")}
                className={styles.filterButton}
                isIconOnly
                onPress={() => router.push("/discovery/clubs")}
                size="lg"
                variant="ghost"
              >
                <Funnel1 size={22} />
              </Button>
              <Button
                aria-expanded={isLocationOpen}
                aria-haspopup="dialog"
                aria-label={t("locationChipAria", { location: locationLabel })}
                className={styles.locationChip}
                onPress={() => setIsLocationOpen(true)}
                size="sm"
                variant="secondary"
              >
                <span className={styles.locationLabel}>{locationLabel}</span>
                <ChevronDown size={16} />
              </Button>
              <Button
                aria-label={t("searchAria")}
                className={styles.searchButton}
                isIconOnly
                onPress={() => router.push("/discovery/search")}
                size="lg"
                variant="ghost"
              >
                <MagnifyingGlass size={22} />
              </Button>
            </div>
          </header>
          <DiscoveryLocationSheet
            addresses={addresses}
            addLabel={t("locationSheetAdd")}
            closeLabel={t("locationSheetClose")}
            description={t("locationSheetDescription")}
            emptyLabel={t("locationSheetEmpty")}
            isOpen={isLocationOpen}
            onAddNew={() =>
              router.push(
                isAuthenticated ? "/athlete/profile/edit" : "/auth/login",
              )
            }
            onOpenChange={setIsLocationOpen}
            onSelect={setSelectedAddressId}
            selectedId={selectedAddress?.id ?? ""}
            title={t("locationSheetTitle")}
            updateLabel={t("locationSheetUpdate")}
          />
        </>
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

        <nav aria-label={t("quickNavLabel")} className={styles.quickNav}>
          <QuickActionCard
            className={styles.quickNavMap}
            icon={<MapTrifold size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickMap")}
            labelClassName={styles.quickNavMapLabel}
            layout="row"
            tileClassName={styles.quickNavMapTile}
            onPress={() => router.push("/discovery/map")}
          />
          <QuickActionCard
            icon={<Building2 size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickClubs")}
            layout="row"
            onPress={() => router.push("/discovery/clubs")}
          />
          <QuickActionCard
            className={styles.quickNavWide}
            icon={<UsersTwo size={QUICK_NAV_ICON_SIZE} />}
            label={t("quickCoaches")}
            layout="row"
            onPress={() => router.push("/discovery/coaches")}
          />
        </nav>

        {banners.length > 1 ? (
          <BannerCarousel
            aria-label={t("bannersLabel")}
            slideLabel={(current, total) =>
              t("bannerSlideLabel", { current, total })
            }
            slides={banners.slice(1).map((slide) => ({
              id: slide.id,
              imageUrl: slide.imageUrl,
              alt: slide.alt,
              onPress:
                slide.linkKind !== "none" && slide.linkUrl
                  ? () => openBannerLink(slide.linkKind, slide.linkUrl)
                  : undefined,
            }))}
          />
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : null}

        {sports.length > 0 ? (
          <SectionRail
            ariaLabel={t("sportsTitle")}
            hint={t("sportsHint")}
            seeAllLabel={t("seeAll")}
            scrollerClassName={styles.sportsBento}
            title={t("sportsTitle")}
            onSeeAll={() => router.push("/discovery/sports")}
          >
            {sports.slice(0, 5).map((sport, index) => {
              const theme =
                HOME_SPORT_THEMES[index % HOME_SPORT_THEMES.length]!;
              return (
                <SportCard
                  actionColor={theme.actionColor}
                  actionForegroundColor={theme.actionForegroundColor}
                  actionLabel={t("viewSport")}
                  className={
                    index === 0 ? styles.sportCardFeatured : styles.sportCard
                  }
                  color={theme.color}
                  foregroundColor={theme.foregroundColor}
                  key={sport.id}
                  size="sm"
                  sport={{
                    title: sport.name,
                    subtitle: sport.description ?? t("sportLabel"),
                    backgroundImage: sport.image,
                  }}
                  onPress={() =>
                    router.push(`/discovery/sports/${sport.id}`)
                  }
                />
              );
            })}
          </SectionRail>
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

        <DiscoveryHomeMapCtaSection
          ctaLabel={t("mapCta")}
          eyebrow={t("mapEyebrow")}
          subtitle={t("mapSubtitle")}
          title={t("mapTitle")}
          onPress={() => router.push("/discovery/map")}
        />

        {open24Clubs.length > 0 ? (
          <SectionRail
            ariaLabel={t("open24Title")}
            hint={t("open24Hint")}
            seeAllLabel={t("seeAll")}
            title={t("open24Title")}
            onSeeAll={() => router.push("/discovery/clubs?amenitySlug=24h")}
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
            onSeeAll={() => router.push("/discovery/classes")}
          >
            {classes.map((item) => {
              const href = `/discovery/classes/${item.id}?clubId=${encodeURIComponent(item.clubId)}`;
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

        {equipment.length > 0 ? (
          <section
            aria-label={t("equipmentTitle")}
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <span aria-hidden className={styles.sectionAccent} />
                <Typography
                  className={styles.sectionTitle}
                  type="h3"
                  weight="bold"
                >
                  {t("equipmentTitle")}
                </Typography>
              </div>
              <Link
                className={styles.seeAll}
                onPress={() => router.push("/discovery/clubs")}
              >
                {t("seeAll")}
              </Link>
            </div>
            <div className={styles.equipmentGrid}>
              {equipment.map((item) => (
                <EquipmentBrowseCard
                  image={item.image || PLACEHOLDER_IMAGE}
                  imageAlt={item.name}
                  key={item.id}
                  size={item.size ?? "md"}
                  title={item.name}
                  onPress={() => router.push(item.href)}
                />
              ))}
            </div>
          </section>
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
