"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/shared/lib/app-router";
import type { Banner } from "@repo/api/banners";
import {
  resolveDiscoveryActionButtonVariant,
  type DiscoveryArticleCard,
  type DiscoveryClubCard,
  type DiscoveryCoach,
  type DiscoveryClass,
  type DiscoveryLocationCard,
  type DiscoveryMembershipPlanCard,
  type DiscoverySlotCard,
  type DiscoverySpaceCard,
  type ResolvedDiscoverySection,
} from "@repo/api/discovery";
import type { RefItem, SportNode } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { mediaFileUrl } from "@/shared/lib/api";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { HomeLocationKind } from "../../lib/home-browse-data";
import {
  formatArticleJalaliDate,
  type HomeEditorialArticle,
} from "../../lib/articles-home";
import type { PlacementBanner } from "../../lib/use-placement-banners";
import {
  mapSportCategoryNodesToHomeItems,
  mapSportNodesToHomeItems,
} from "../../lib/sports-home";
import { mapClubCategoryRefsToHomeItems } from "../../lib/club-categories-home";
import { useDiscoveryFeed } from "../../lib/use-discovery-feed";
import { ConnectionErrorState } from "@/shared/components/ConnectionErrorState";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import type { ConnectionErrorKind } from "@/shared/lib/classify-connection-error";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsColumnSection } from "../../sections/DiscoveryHomeClubsColumnSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import {
  DiscoveryHomeCatalogRailSection,
  type DiscoveryHomeCatalogRailItem,
  type DiscoveryHomeCatalogRailVariant,
} from "../../sections/DiscoveryHomeCatalogRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryLocationMapCtaSection } from "../../sections/DiscoveryLocationMapCtaSection";
import { DiscoveryPopularLocationsSection } from "../../sections/DiscoveryPopularLocationsSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import type { DiscoverySectionSheetTone } from "../../sections/DiscoverySectionRail";
import { DiscoveryFeedSkeleton } from "./DiscoveryFeedSkeleton";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";

function readLocationFilter(
  section: ResolvedDiscoverySection,
  key: "locationKind" | "target",
): string | undefined {
  const value = section.source.filters?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function mapLocationCards(section: ResolvedDiscoverySection) {
  return (section.items as DiscoveryLocationCard[]).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    image: mediaFileUrl(item.coverMediaId) ?? PLACEHOLDER_IMAGE,
    kind: item.kind,
    count: item.count,
  }));
}

function mapSectionBanners(section: ResolvedDiscoverySection): PlacementBanner[] {
  return (section.items as Banner[])
    .map((banner) => {
      const slides = banner.slides.flatMap((slide, index) => {
        const imageUrl = mediaFileUrl(slide.mediaId);
        if (!imageUrl) return [];
        return [
          {
            id: `${banner.slug}-${index}`,
            imageUrl,
            alt: slide.alt,
            linkKind: slide.linkKind,
            linkUrl: slide.linkUrl,
            gradient: slide.gradient,
            title: slide.title,
            action: slide.action,
          },
        ];
      });
      if (slides.length === 0) return null;
      return {
        id: banner.id,
        slug: banner.slug,
        label: banner.label,
        ratio: banner.ratio,
        radius: banner.radius,
        slides,
      };
    })
    .filter((banner): banner is PlacementBanner => banner != null);
}

function clubCards(section: ResolvedDiscoverySection): BrowseClub[] {
  return (section.items as DiscoveryClubCard[]).map((club) => ({
    id: club.id,
    title: club.name,
    location: club.address ?? "موقعیت نامشخص",
    image:
      mediaFileUrl(club.coverMediaId) ??
      mediaFileUrl(club.galleryMediaId) ??
      PLACEHOLDER_IMAGE,
    rating: club.rating,
    ratingCount: club.reviewCount,
    price:
      club.startingPriceAmount == null
        ? "قیمت نامشخص"
        : `از ${club.startingPriceAmount.toLocaleString("fa-IR")} تومان`,
    featureLabels: club.amenityNames,
    sportIds: club.sportIds,
    distanceLabel: "",
    openState: club.operationalStatus === "active" ? "open" : "closed",
  }));
}

function articleCards(
  section: ResolvedDiscoverySection,
): HomeEditorialArticle[] {
  return (section.items as DiscoveryArticleCard[]).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    kind: article.taxonomy.kind,
    authorName: article.authorName,
    publishedAtLabel: formatArticleJalaliDate(
      article.publishedAt ?? article.createdAt,
    ),
    readingTimeMinutes: article.readingTimeMinutes,
  }));
}

function listingClubsFromSections(
  sections: ResolvedDiscoverySection[],
): BrowseClub[] {
  const seen = new Set<string>();
  const clubs: BrowseClub[] = [];

  for (const section of sections) {
    if (section.kind !== "clubs") continue;
    for (const club of clubCards(section)) {
      if (seen.has(club.id)) continue;
      seen.add(club.id);
      clubs.push(club);
    }
  }

  return clubs.slice(0, 6);
}

function toneOf(section: ResolvedDiscoverySection): DiscoverySectionSheetTone {
  const tone = section.presentation.background?.tone;
  return tone === "warning" ||
    tone === "accent" ||
    tone === "muted" ||
    tone === "surface"
    ? tone
    : "surface";
}

function coachItems(
  section: ResolvedDiscoverySection,
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as DiscoveryCoach[]).map((coach) => ({
    id: coach.userId,
    title:
      [coach.user.name.first, coach.user.name.last].filter(Boolean).join(" ") ||
      "مربی",
    eyebrow:
      coach.verification.status === "approved" ? "مربی تأییدشده" : undefined,
    meta:
      coach.experience.headline ??
      (coach.experience.years
        ? `${coach.experience.years} سال سابقه`
        : undefined),
    image: mediaFileUrl(coach.user.avatar.mediaId) ?? undefined,
    href: `/discovery/coaches/${coach.userId}`,
  }));
}

function classItems(
  section: ResolvedDiscoverySection,
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as DiscoveryClass[]).map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.club.name,
    meta: item.description ?? undefined,
    image:
      mediaFileUrl(item.media.coverMediaId) ??
      mediaFileUrl(item.club.coverMediaId) ??
      undefined,
    href: `/discovery/classes/${item.id}?clubId=${encodeURIComponent(item.clubId)}`,
  }));
}

function spaceItems(
  section: ResolvedDiscoverySection,
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as DiscoverySpaceCard[]).map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.clubName,
    meta: item.description ?? undefined,
    image: mediaFileUrl(item.coverMediaId) ?? undefined,
    href: `/discovery/clubs/${item.clubId}`,
  }));
}

function slotItems(
  section: ResolvedDiscoverySection,
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as DiscoverySlotCard[]).map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.clubName,
    meta: `${item.date} · ${item.startTime} تا ${item.endTime} · ${item.remaining.toLocaleString("fa-IR")} جای خالی`,
    image: mediaFileUrl(item.coverMediaId) ?? undefined,
    href:
      item.kind === "class" && item.resourceId
        ? `/discovery/classes/${item.resourceId}?clubId=${encodeURIComponent(item.clubId)}`
        : `/discovery/clubs/${item.clubId}`,
  }));
}

function refItems(
  section: ResolvedDiscoverySection,
  filterKey: "equipmentSlug" | "amenitySlug",
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as Array<RefItem & { count?: number }>).map((item) => ({
    id: item.id,
    title: item.name,
    meta: item.count
      ? `${item.count.toLocaleString("fa-IR")} باشگاه`
      : undefined,
    image: mediaFileUrl(item.coverMediaId) ?? undefined,
    href: `/discovery/clubs?${filterKey}=${encodeURIComponent(item.slug)}`,
  }));
}

function membershipItems(
  section: ResolvedDiscoverySection,
): DiscoveryHomeCatalogRailItem[] {
  return (section.items as DiscoveryMembershipPlanCard[]).map((item) => ({
    id: item.id,
    title: item.name,
    eyebrow: item.clubName,
    meta: `${item.amount.toLocaleString("fa-IR")} تومان`,
    href: `/discovery/clubs/${item.clubId}`,
  }));
}

function catalogSection(
  section: ResolvedDiscoverySection,
  items: DiscoveryHomeCatalogRailItem[],
  variant: DiscoveryHomeCatalogRailVariant,
) {
  const action = section.content.action;
  return (
    <DiscoveryHomeCatalogRailSection
      hint={section.content.subtitle}
      items={items}
      pattern={Boolean(section.presentation.background?.pattern)}
      seeAllHref={action?.link}
      seeAllLabel={action?.label}
      seeAllVariant={resolveDiscoveryActionButtonVariant(action?.variant)}
      title={section.content.title}
      tone={toneOf(section)}
      variant={variant}
    />
  );
}

function DynamicSection({ section }: { section: ResolvedDiscoverySection }) {
  const action = section.content.action;
  const actionHref = action?.link;
  const seeAllLabel = action?.label;
  const seeAllVariant = resolveDiscoveryActionButtonVariant(action?.variant);
  switch (section.kind) {
    case "banners":
      return <DiscoveryHomeBannersSection banners={mapSectionBanners(section)} />;
    case "club_categories": {
      const refs = section.items as Array<RefItem & { count?: number }>;
      const counts = new Map(refs.map((item) => [item.id, item.count ?? 0]));
      return (
        <DiscoveryHomeClubCategoriesSection
          categories={mapClubCategoryRefsToHomeItems(refs, counts)}
          hint={section.content.subtitle}
          pattern={Boolean(section.presentation.background?.pattern)}
          title={section.content.title}
          tone={toneOf(section)}
        />
      );
    }
    case "sport_categories":
      return (
        <DiscoveryHomeSportCategoriesSection
          categories={mapSportCategoryNodesToHomeItems(
            section.items as SportNode[],
            (sport) => mediaFileUrl(sport.coverMediaId) ?? undefined,
          )}
          hint={section.content.subtitle}
          seeAllHref={actionHref}
          seeAllLabel={seeAllLabel}
          seeAllVariant={seeAllVariant}
          title={section.content.title}
        />
      );
    case "sports":
      return (
        <DiscoveryHomeSportsSection
          hint={section.content.subtitle}
          seeAllHref={actionHref}
          seeAllLabel={seeAllLabel}
          seeAllVariant={seeAllVariant}
          sports={mapSportNodesToHomeItems(
            section.items as SportNode[],
            (sport) => mediaFileUrl(sport.coverMediaId) ?? undefined,
          )}
          title={section.content.title}
        />
      );
    case "clubs":
      return (
        <DiscoveryHomeClubsRailSection
          ariaLabel={section.content.title || "باشگاه‌ها"}
          clubs={clubCards(section)}
          hint={section.content.subtitle}
          keyPrefix={section.id}
          pattern={Boolean(section.presentation.background?.pattern)}
          seeAllHref={actionHref}
          seeAllLabel={seeAllLabel}
          seeAllVariant={seeAllVariant}
          title={section.content.title}
          tone={toneOf(section)}
        />
      );
    case "coaches":
      return catalogSection(section, coachItems(section), "portrait");
    case "classes":
      return catalogSection(section, classItems(section), "media");
    case "spaces":
      return catalogSection(section, spaceItems(section), "media");
    case "slots":
      return catalogSection(section, slotItems(section), "schedule");
    case "equipment":
      return catalogSection(
        section,
        refItems(section, "equipmentSlug"),
        "tile",
      );
    case "membership_plans":
      return catalogSection(section, membershipItems(section), "pricing");
    case "bookable_offers":
      return catalogSection(section, slotItems(section), "schedule");
    case "amenities":
      return catalogSection(section, refItems(section, "amenitySlug"), "tile");
    case "locations":
      return (
        <DiscoveryPopularLocationsSection
          hint={section.content.subtitle}
          kind={
            (readLocationFilter(section, "locationKind") as HomeLocationKind) ??
            "city"
          }
          locations={mapLocationCards(section)}
          seeAllHref={actionHref}
          seeAllLabel={seeAllLabel}
          target={
            (readLocationFilter(section, "target") as "clubs" | "coaches") ??
            "clubs"
          }
          title={section.content.title}
        />
      );
    case "articles":
      return (
        <DiscoveryHomeArticlesSection
          articles={articleCards(section)}
          hint={section.content.subtitle}
          seeAllHref={actionHref}
          seeAllLabel={seeAllLabel}
          seeAllVariant={seeAllVariant}
          title={section.content.title}
        />
      );
    default:
      return null;
  }
}

export function DiscoveryFeedHomeScreen() {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const feed = useDiscoveryFeed(selectedLocation);
  const { isOnline } = useNetworkStatus();

  const errorKind: ConnectionErrorKind | null = !isOnline
    ? "network"
    : feed.error;
  const showConnectionError =
    errorKind != null && feed.sections.length === 0 && !feed.isLoading;

  const listingClubs = useMemo(
    () => listingClubsFromSections(feed.sections),
    [feed.sections],
  );

  const content = useMemo(() => {
    let mapCtaInserted = false;

    return feed.sections.flatMap((section) => {
      const sectionNode =
        section.kind === "banners" ? (
          <div className={styles.banners} key={section.id}>
            <DynamicSection section={section} />
          </div>
        ) : (
          <DynamicSection key={section.id} section={section} />
        );

      if (section.kind !== "amenities" || mapCtaInserted) {
        return [sectionNode];
      }

      mapCtaInserted = true;
      return [
        <DiscoveryLocationMapCtaSection
          ctaLabel={t("mapCta")}
          key="discovery-map-cta"
          subtitle={t("mapSubtitle")}
          title={t("mapTitle")}
          onPress={() => router.push("/discovery/map")}
        />,
        sectionNode,
      ];
    });
  }, [feed.sections, router, t]);

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection
          locationLabel={t("locationFallback")}
          onLocationChange={(address) => setSelectedLocation(address.point)}
        />
      }
    >
      <div aria-busy={feed.isLoading} className={styles.content}>
        <div className={styles.sheets}>
          {feed.isLoading && feed.sections.length === 0 ? (
            <DiscoveryFeedSkeleton />
          ) : showConnectionError ? (
            <ConnectionErrorState
              kind={errorKind}
              statusCode={feed.errorStatusCode}
              onDashboard={() => void feed.reload()}
              onRetry={() => void feed.reload()}
            />
          ) : (
            <>
              {content}
              {listingClubs.length > 0 ? (
                <DiscoveryHomeClubsColumnSection
                  ariaLabel={t("listingClubsTitle")}
                  clubs={listingClubs}
                  hint={t("listingClubsHint")}
                  keyPrefix="listing"
                  seeAllHref="/discovery/clubs"
                  title={t("listingClubsTitle")}
                  tone="surface"
                />
              ) : null}
            </>
          )}
        </div>
        <span aria-live="polite" className="sr-only" role="status">
          {feed.isLoading ? t("loading") : ""}
        </span>
      </div>
    </AppLayout>
  );
}
