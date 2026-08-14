"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ArticleSummary } from "@repo/api";
import type { ClubClass } from "@repo/api/discovery";
import {
  articlesApi,
  basicsLocations,
  basicsSports,
  discoveryClubSlots,
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
  galleryItemsFromClubs,
  mapLocationToHomeItem,
  mapSportToHomeItem,
  type HomeAmenityItem,
  type HomeArticleItem,
  type HomeClassItem,
  type HomeFeatureItem,
  type HomeGalleryItem,
  type HomeLocationItem,
  type HomeSportItem,
} from "./home-browse-data";
import { mapDiscoveryClassToPreview } from "./map-discovery-class";
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
  return mediaFileUrl(node.coverMediaId) ?? undefined;
}

function coachNameFromClass(cls: ClubClass): string {
  if (cls.coach && typeof cls.coach === "object" && "name" in cls.coach) {
    const name = cls.coach.name as {
      first?: string | null;
      last?: string | null;
    };
    return [name.first, name.last].filter(Boolean).join(" ").trim();
  }
  return "";
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
        const [countriesPage, sportsPage, clubsPage, coachesPage, articlesPage] =
          await Promise.all([
            basicsLocations.listCountries(),
            basicsSports.listSports(),
            discoveryClubs.list({ page_size: 16 }),
            discoveryCoaches.list({ page_size: 8 }),
            articlesApi.list({ page_size: 8 }).catch(() => null),
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

        const classClubIds = clubs.slice(0, 4).map((c) => c.id);
        const classLists = await Promise.all(
          classClubIds.map((clubId) =>
            discoveryClubSlots.listClasses(clubId).catch(() => null),
          ),
        );
        if (cancelled) return;

        const classes: HomeClassItem[] = [];
        for (let i = 0; i < classLists.length; i++) {
          const list = classLists[i];
          const clubId = classClubIds[i];
          if (!list || !clubId) continue;
          for (const cls of list.result.slice(0, 3)) {
            const preview = mapDiscoveryClassToPreview(cls);
            classes.push({
              id: preview.id,
              clubId,
              title: preview.title,
              author: preview.author || coachNameFromClass(cls) || "مربی",
              category: preview.category,
              date: preview.date,
              duration: preview.duration,
              backgroundImage: preview.backgroundImage,
            });
          }
        }

        const slices = buildSlices(clubs);
        const articles =
          articlesPage?.result.map(mapArticleToHomeItem) ?? [];

        setState({
          features: HOME_FEATURE_ITEMS,
          cities,
          ...slices,
          coaches,
          coachCityName,
          classes: classes.slice(0, 10),
          amenities: MOCK_AMENITIES,
          sports: sportsPage.result.slice(0, 12).map((s) =>
            mapSportToHomeItem(s, sportImage(s)),
          ),
          articles,
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
