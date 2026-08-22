"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ArticleSummary } from "@repo/api";
import {
  articlesApi,
  basicsLocations,
  basicsSports,
  discoveryClasses,
  discoveryClubs,
  discoveryCoaches,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  clubsNearby,
  clubsOpen24Hours,
  sortClubsByRating,
  type BrowseClub,
} from "./clubs-browse-data";
import {
  type FeaturedCoach,
} from "./coaches-browse-data";
import {
  DEFAULT_COACH_CITY_NAME,
  HOME_FEATURE_ITEMS,
  MOCK_AMENITIES,
  MOCK_EQUIPMENT,
  galleryItemsFromClubs,
  mapLocationToHomeItem,
  mapSportToHomeItem,
  type HomeAmenityItem,
  type HomeArticleItem,
  type HomeClassItem,
  type HomeEquipmentItem,
  type HomeFeatureItem,
  type HomeGalleryItem,
  type HomeLocationItem,
  type HomeSportItem,
} from "./home-browse-data";
import { mapDiscoveryClassToHomeItem } from "./map-discovery-class";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";
import { mapDiscoveryCoachToFeatured } from "./map-discovery-coach";

export type DiscoveryHomeState = {
  features: HomeFeatureItem[];
  cities: HomeLocationItem[];
  nearbyClubs: BrowseClub[];
  topClubs: BrowseClub[];
  open24Clubs: BrowseClub[];
  coaches: FeaturedCoach[];
  coachCityName: string;
  classes: HomeClassItem[];
  amenities: HomeAmenityItem[];
  equipment: HomeEquipmentItem[];
  sports: HomeSportItem[];
  articles: HomeArticleItem[];
  galleryItems: HomeGalleryItem[];
  isLoading: boolean;
  source: "api" | "mock";
};

const ARTICLE_KIND_LABELS: Record<string, string> = {
  guide: "راهنما",
  news: "خبر",
  tip: "نکته",
  story: "داستان",
  workout: "تمرین",
};

function formatArticleCount(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatArticleRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `${Math.max(1, minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ماه پیش`;
  return `${Math.floor(months / 12)} سال پیش`;
}

function formatArticleCategory(article: ArticleSummary): string {
  return (
    ARTICLE_KIND_LABELS[article.taxonomy.kind] ??
    article.taxonomy.category.replace(/-/g, " ")
  );
}

function mapArticleToHomeItem(article: ArticleSummary): HomeArticleItem {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: formatArticleCategory(article),
    coverSrc: mediaFileUrl(article.coverMediaId),
    authorName: article.author.name || "Gym4Me",
    authorAvatarSrc: mediaFileUrl(article.author.avatarMediaId),
    publishedAtLabel: formatArticleRelativeTime(
      article.publishedAt ?? article.createdAt,
    ),
    readingTimeMinutes: article.readingTimeMinutes,
    viewsLabel: formatArticleCount(article.engagement.viewsCount),
    likesLabel: formatArticleCount(article.engagement.likesCount),
    tags: article.tags.slice(0, 3),
  };
}

function buildSlices(clubs: BrowseClub[]): Pick<
  DiscoveryHomeState,
  "nearbyClubs" | "topClubs" | "open24Clubs" | "galleryItems"
> {
  return {
    nearbyClubs: clubsNearby(clubs).slice(0, 8),
    topClubs: sortClubsByRating(clubs).slice(0, 8),
    open24Clubs: clubsOpen24Hours(clubs).slice(0, 8),
    galleryItems: galleryItemsFromClubs(clubs),
  };
}

function locationImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

function sportImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function useDiscoveryHome(): DiscoveryHomeState {
  const [state, setState] = useState<DiscoveryHomeState>({
    features: HOME_FEATURE_ITEMS,
    cities: [],
    nearbyClubs: [],
    topClubs: [],
    open24Clubs: [],
    coaches: [],
    coachCityName: DEFAULT_COACH_CITY_NAME,
    classes: [],
    amenities: [],
    equipment: MOCK_EQUIPMENT,
    sports: [],
    articles: [],
    galleryItems: [],
    isLoading: true,
    source: "api",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [countriesPage, sportsPage, clubsPage, coachesPage, articlesPage, classesPage] =
          await Promise.all([
            basicsLocations.listCountries(),
            basicsSports.listSports(),
            discoveryClubs.list({ page_size: 16 }),
            discoveryCoaches.list({ page_size: 8 }),
            articlesApi.list({ page_size: 8 }).catch(() => null),
            discoveryClasses.list({ page_size: 10 }).catch(() => null),
          ]);

        if (cancelled) return;

        const iran =
          countriesPage.result.find((c) => c.slug === "iran") ??
          countriesPage.result[0];

        let cities: HomeLocationItem[] = [];
        let coachCityName = DEFAULT_COACH_CITY_NAME;

        if (iran) {
          const provincesRes = await basicsLocations.listProvinces(iran.id);
          if (cancelled) return;

          const cityBatches = await Promise.all(
            provincesRes.result.slice(0, 4).map((p) =>
              basicsLocations.listCities(p.id).catch(() => null),
            ),
          );
          if (cancelled) return;

          const cityMap = new Map<string, HomeLocationItem>();
          for (const batch of cityBatches) {
            if (!batch) continue;
            for (const city of batch.result) {
              cityMap.set(
                city.id,
                mapLocationToHomeItem(city, locationImage(city)),
              );
            }
          }
          cities = [...cityMap.values()].slice(0, 12);
          const tehran =
            cities.find((c) => /تهران|tehran/i.test(c.name)) ?? cities[0];
          if (tehran) coachCityName = tehran.name;
        }

        const clubs = clubsPage.result.map((club) =>
          mapDiscoveryClubToBrowse(club as never),
        );

        const coaches = coachesPage.result
          .slice(0, 8)
          .map(mapDiscoveryCoachToFeatured);

        const classes: HomeClassItem[] = (classesPage?.result ?? [])
          .slice(0, 10)
          .map(mapDiscoveryClassToHomeItem);

        const slices = buildSlices(clubs);
        const articles =
          articlesPage?.result.map(mapArticleToHomeItem) ?? [];

        setState({
          features: HOME_FEATURE_ITEMS,
          cities,
          ...slices,
          coaches,
          coachCityName,
          classes,
          amenities: MOCK_AMENITIES,
          equipment: MOCK_EQUIPMENT,
          sports: sportsPage.result.slice(0, 12).map((s) =>
            mapSportToHomeItem(s, sportImage(s)),
          ),
          articles,
          galleryItems: galleryItemsFromClubs(clubs),
          isLoading: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          source: "api",
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
