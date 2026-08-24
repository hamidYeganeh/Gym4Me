"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Banner } from "@repo/api/banners";
import type {
  DiscoveryArticleCard,
  DiscoveryClubCard,
  DiscoveryCoach,
  DiscoveryClass,
  DiscoveryMembershipPlanCard,
  DiscoverySlotCard,
  DiscoverySpaceCard,
  ResolvedDiscoverySection,
} from "@repo/api/discovery";
import type { RefItem, SportNode } from "@repo/api";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { mediaFileUrl } from "@/shared/lib/api";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import {
  formatArticleJalaliDate,
  type HomeEditorialArticle,
} from "../../lib/articles-home";
import type { PlacementBannerSlide } from "../../lib/use-placement-banners";
import {
  mapSportCategoryNodesToHomeItems,
  mapSportNodesToHomeItems,
} from "../../lib/sports-home";
import { mapClubCategoryRefsToHomeItems } from "../../lib/club-categories-home";
import { useDiscoveryFeed } from "../../lib/use-discovery-feed";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import {
  DiscoveryHomeCatalogRailSection,
  type DiscoveryHomeCatalogRailItem,
  type DiscoveryHomeCatalogRailVariant,
} from "../../sections/DiscoveryHomeCatalogRailSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import type { DiscoverySectionSheetTone } from "../../sections/DiscoverySectionRail";
import { DiscoveryFeedSkeleton } from "./DiscoveryFeedSkeleton";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";

function bannerSlides(
  section: ResolvedDiscoverySection,
): PlacementBannerSlide[] {
  const slides: PlacementBannerSlide[] = [];
  for (const banner of section.items as Banner[]) {
    banner.slides.forEach((slide, index) => {
      const imageUrl = mediaFileUrl(slide.mediaId);
      if (!imageUrl) return;
      slides.push({
        id: `${banner.id}-${index}`,
        imageUrl,
        alt: slide.alt,
        linkKind: slide.linkKind,
        linkUrl: slide.linkUrl,
        ratio: slide.ratio,
        radius: slide.radius,
        gradient: slide.gradient,
        title: slide.title,
        action: slide.action,
      });
    });
  }
  return slides;
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
    price: "—",
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
  return (
    <DiscoveryHomeCatalogRailSection
      hint={section.content.subtitle}
      items={items}
      pattern={Boolean(section.presentation.background?.pattern)}
      seeAllHref={section.content.action?.link}
      title={section.content.title}
      tone={toneOf(section)}
      variant={variant}
    />
  );
}

function DynamicSection({ section }: { section: ResolvedDiscoverySection }) {
  const actionHref = section.content.action?.link;
  switch (section.kind) {
    case "banners":
      return <DiscoveryHomeBannersSection banners={bannerSlides(section)} />;
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
          title={section.content.title}
        />
      );
    case "sports":
      return (
        <DiscoveryHomeSportsSection
          hint={section.content.subtitle}
          seeAllHref={actionHref}
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
    case "articles":
      return (
        <DiscoveryHomeArticlesSection
          articles={articleCards(section)}
          hint={section.content.subtitle}
          seeAllHref={actionHref}
          title={section.content.title}
        />
      );
    default:
      return null;
  }
}

export function DiscoveryFeedHomeScreen() {
  const t = useTranslations("DiscoveryHome");
  const feed = useDiscoveryFeed();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMore = feed.loadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !feed.hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [feed.hasMore, loadMore]);

  const content = useMemo(
    () =>
      feed.sections.map((section) =>
        section.kind === "banners" ? (
          <div className={styles.banners} key={section.id}>
            <DynamicSection section={section} />
          </div>
        ) : (
          <DynamicSection key={section.id} section={section} />
        ),
      ),
    [feed.sections],
  );

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection locationLabel={t("locationFallback")} />
      }
    >
      <div
        aria-busy={feed.isLoading || feed.isLoadingMore}
        className={styles.content}
      >
        <div className={styles.sheets}>
          {feed.isLoading && feed.sections.length === 0 ? (
            <DiscoveryFeedSkeleton />
          ) : (
            content
          )}
          {feed.isLoadingMore ? <DiscoveryFeedSkeleton mode="more" /> : null}
        </div>
        <span aria-live="polite" className="sr-only" role="status">
          {feed.isLoading
            ? t("loading")
            : feed.isLoadingMore
              ? t("loadingMore")
              : ""}
        </span>
        {feed.error && feed.sections.length === 0 ? (
          <button
            className="mx-auto my-8 block rounded-full bg-primary px-5 py-3 text-primary-foreground"
            type="button"
            onClick={() => void feed.reload()}
          >
            تلاش دوباره
          </button>
        ) : null}
        <div aria-hidden className="h-1" ref={sentinelRef} />
      </div>
    </AppLayout>
  );
}
