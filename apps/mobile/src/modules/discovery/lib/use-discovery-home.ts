"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { ClubClass } from "@repo/api/discovery";
import {
  basicsLocations,
  basicsSports,
  discoveryClubSlots,
  discoveryClubs,
  discoveryCoaches,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  FEATURED_CLUBS,
  type BrowseClub,
} from "./clubs-browse-data";
import {
  POPULAR_COACHES,
  type PopularCoach,
} from "./coaches-browse-data";
import {
  MOCK_CITIES,
  MOCK_PROVINCES,
  MOCK_SPORT_CATEGORIES,
  MOCK_SPORTS,
  mapLocationToHomeItem,
  mapSportToHomeItem,
  type HomeClassItem,
  type HomeLocationItem,
  type HomeSportItem,
} from "./home-browse-data";
import { mapDiscoveryClassToPreview } from "./map-discovery-class";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";
import { mapDiscoveryCoachToPopular } from "./map-discovery-coach";

export type DiscoveryHomeState = {
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  sportCategories: HomeSportItem[];
  sports: HomeSportItem[];
  clubs: BrowseClub[];
  coaches: PopularCoach[];
  classes: HomeClassItem[];
  isLoading: boolean;
  source: "api" | "mock";
};

const MOCK_STATE: DiscoveryHomeState = {
  provinces: MOCK_PROVINCES,
  cities: MOCK_CITIES,
  sportCategories: MOCK_SPORT_CATEGORIES,
  sports: MOCK_SPORTS,
  clubs: FEATURED_CLUBS,
  coaches: POPULAR_COACHES,
  classes: [],
  isLoading: false,
  source: "mock",
};

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
    ...MOCK_STATE,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [countriesPage, sportsPage, categoriesPage, clubsPage, coachesPage] =
          await Promise.all([
            basicsLocations.listCountries(),
            basicsSports.listSports(),
            basicsSports.listCategories(),
            discoveryClubs.list({ page_size: 8 }),
            discoveryCoaches.list({ page_size: 8 }),
          ]);

        if (cancelled) return;

        const iran =
          countriesPage.result.find((c) => c.slug === "iran") ??
          countriesPage.result[0];

        let provinces: HomeLocationItem[] = [];
        let cities: HomeLocationItem[] = [];

        if (iran) {
          const provincesRes = await basicsLocations.listProvinces(iran.id);
          if (cancelled) return;
          provinces = provincesRes.result.slice(0, 12).map((p) =>
            mapLocationToHomeItem(p, locationImage(p), "استان"),
          );

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
        }

        const clubs =
          clubsPage.result.length > 0
            ? clubsPage.result.map((club) =>
                mapDiscoveryClubToBrowse(club as never),
              )
            : FEATURED_CLUBS;

        const coaches =
          coachesPage.result.length > 0
            ? coachesPage.result.slice(0, 8).map(mapDiscoveryCoachToPopular)
            : POPULAR_COACHES;

        const classClubIds = clubsPage.result.slice(0, 3).map((c) => c.id);
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

        setState({
          provinces: provinces.length > 0 ? provinces : MOCK_PROVINCES,
          cities: cities.length > 0 ? cities : MOCK_CITIES,
          sportCategories:
            categoriesPage.result.length > 0
              ? categoriesPage.result.map((s) =>
                  mapSportToHomeItem(s, sportImage(s)),
                )
              : MOCK_SPORT_CATEGORIES,
          sports:
            sportsPage.result.length > 0
              ? sportsPage.result.slice(0, 12).map((s) =>
                  mapSportToHomeItem(s, sportImage(s)),
                )
              : MOCK_SPORTS,
          clubs,
          coaches,
          classes: classes.slice(0, 8),
          isLoading: false,
          source:
            clubsPage.result.length > 0 || coachesPage.result.length > 0
              ? "api"
              : "mock",
        });
      } catch {
        if (cancelled) return;
        setState(MOCK_STATE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
