"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  basicsLocations,
  accountMemberships,
  discoveryClubs,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  CLUB_DISCOVERY_FILTERS,
  matchDiscoveryFilterFromQuery,
  type ClubDiscoveryFilter,
  type ClubDiscoveryFilterId,
} from "./club-discovery-filters";
import {
  mapLocationToHomeItem,
  type HomeLocationItem,
} from "./home-browse-data";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";
import type { BrowseClub } from "./clubs-browse-data";

export type DiscoveryClubsBrowseOptions = {
  locationId?: string | null;
  sportId?: string | null;
  categoryId?: string | null;
  genderPolicy?: string | null;
  amenitySlug?: string | null;
  accessibility?: string | null;
  ageGroupKey?: string | null;
  levelKey?: string | null;
};

export type DiscoveryClubsBrowseState = {
  clubs: BrowseClub[];
  filters: ClubDiscoveryFilter[];
  activeFilter: ClubDiscoveryFilterId;
  isLoading: boolean;
  isError: boolean;
  source: "api" | "mock";
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  setActiveFilter: (id: ClubDiscoveryFilterId) => void;
  retry: () => void;
};

function locationImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function useDiscoveryClubsBrowse(
  options: DiscoveryClubsBrowseOptions = {},
): DiscoveryClubsBrowseState {
  const locationId = options.locationId ?? undefined;
  const sportId = options.sportId ?? undefined;
  const categoryId = options.categoryId ?? undefined;
  const genderPolicy = options.genderPolicy ?? undefined;
  const amenitySlug = options.amenitySlug ?? undefined;
  const accessibility = options.accessibility ?? undefined;
  const ageGroupKey = options.ageGroupKey ?? undefined;
  const levelKey = options.levelKey ?? undefined;
  const initialFilter = matchDiscoveryFilterFromQuery({
    genderPolicy,
    amenitySlug,
    accessibility,
    ageGroupKey,
    levelKey,
  });
  const [activeFilter, setActiveFilter] =
    useState<ClubDiscoveryFilterId>(initialFilter);
  const [clubs, setClubs] = useState<BrowseClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [provinces, setProvinces] = useState<HomeLocationItem[]>([]);
  const [cities, setCities] = useState<HomeLocationItem[]>([]);
  const [districts, setDistricts] = useState<HomeLocationItem[]>([]);

  const loadLocations = useCallback(async () => {
    try {
      const countries = await basicsLocations.listCountries();
      const iran =
        countries.result.find((c) => c.slug === "iran" || c.name === "ایران") ??
        countries.result[0];
      if (!iran) return;

      const provincesRes = await basicsLocations.listProvinces(iran.id);
      const nextProvinces = provincesRes.result
        .slice(0, 12)
        .map((p) =>
          mapLocationToHomeItem(p, locationImage(p), "استان", "province"),
        );
      if (nextProvinces.length > 0) setProvinces(nextProvinces);

      const cityMap = new Map<string, HomeLocationItem>();
      const districtList: HomeLocationItem[] = [];

      await Promise.all(
        provincesRes.result.slice(0, 4).map(async (province) => {
          const citiesRes = await basicsLocations.listCities(province.id);
          for (const city of citiesRes.result.slice(0, 6)) {
            cityMap.set(
              city.id,
              mapLocationToHomeItem(city, locationImage(city)),
            );
            try {
              const districtsRes = await basicsLocations.listDistricts(city.id);
              for (const district of districtsRes.result.slice(0, 4)) {
                districtList.push(
                  mapLocationToHomeItem(
                    district,
                    locationImage(district),
                    city.name,
                  ),
                );
              }
            } catch {
              /* districts endpoint may be unavailable */
            }
          }
        }),
      );

      if (cityMap.size > 0) setCities([...cityMap.values()].slice(0, 12));
      if (districtList.length > 0) setDistricts(districtList.slice(0, 16));
    } catch {
      setProvinces([]);
      setCities([]);
      setDistricts([]);
    }
  }, []);

  const loadClubs = useCallback(
    async (filterId: ClubDiscoveryFilterId) => {
      setIsLoading(true);
      setIsError(false);
      const filter = CLUB_DISCOVERY_FILTERS.find((f) => f.id === filterId);
      const scopedFromUrl = {
        ...(locationId ? { locationId } : {}),
        ...(sportId ? { sportId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(genderPolicy ? { genderPolicy } : {}),
        ...(amenitySlug ? { amenitySlug } : {}),
        ...(accessibility ? { accessibility } : {}),
        ...(ageGroupKey ? { ageGroupKey } : {}),
        ...(levelKey ? { levelKey } : {}),
      };
      const query: DiscoveryClubsQuery = {
        page_size: 40,
        ...scopedFromUrl,
        ...(filter?.query ?? {}),
      };

      try {
        const page = await discoveryClubs.list(query);
        const summaries = page.result.length
          ? await accountMemberships
              .listPublicPlanSummaries(page.result.map((club) => club.id))
              .catch(() => ({ items: [] }))
          : { items: [] };
        const summaryByClub = new Map(
          summaries.items.map((summary) => [summary.clubId, summary]),
        );
        setClubs(
          page.result.map((club) =>
            mapDiscoveryClubToBrowse(
              club as never,
              summaryByClub.get(club.id),
            ),
          ),
        );
        setSource("api");
      } catch {
        setClubs([]);
        setIsError(true);
        setSource("api");
      } finally {
        setIsLoading(false);
      }
    },
    [
      accessibility,
      ageGroupKey,
      amenitySlug,
      categoryId,
      genderPolicy,
      levelKey,
      locationId,
      sportId,
    ],
  );

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    void loadClubs(activeFilter);
  }, [activeFilter, loadClubs]);

  return {
    clubs,
    filters: CLUB_DISCOVERY_FILTERS,
    activeFilter,
    isLoading,
    isError,
    source,
    provinces,
    cities,
    districts,
    setActiveFilter,
    retry: () => void loadClubs(activeFilter),
  };
}
