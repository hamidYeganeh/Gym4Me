"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  basicsLocations,
  discoveryClubs,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  BROWSE_CLUBS,
  type BrowseClub,
} from "./clubs-browse-data";
import {
  CLUB_DISCOVERY_FILTERS,
  type ClubDiscoveryFilter,
  type ClubDiscoveryFilterId,
} from "./club-discovery-filters";
import {
  MOCK_CITIES,
  MOCK_DISTRICTS,
  MOCK_PROVINCES_EXTENDED,
  mapLocationToHomeItem,
  type HomeLocationItem,
} from "./home-browse-data";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";

export type DiscoveryClubsBrowseOptions = {
  locationId?: string | null;
  sportId?: string | null;
};

export type DiscoveryClubsBrowseState = {
  clubs: BrowseClub[];
  filters: ClubDiscoveryFilter[];
  activeFilter: ClubDiscoveryFilterId;
  isLoading: boolean;
  source: "api" | "mock";
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  setActiveFilter: (id: ClubDiscoveryFilterId) => void;
};

function locationImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function useDiscoveryClubsBrowse(
  options: DiscoveryClubsBrowseOptions = {},
): DiscoveryClubsBrowseState {
  const locationId = options.locationId ?? undefined;
  const sportId = options.sportId ?? undefined;
  const [activeFilter, setActiveFilter] =
    useState<ClubDiscoveryFilterId>("all");
  const [clubs, setClubs] = useState<BrowseClub[]>(BROWSE_CLUBS);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [provinces, setProvinces] = useState<HomeLocationItem[]>(
    MOCK_PROVINCES_EXTENDED,
  );
  const [cities, setCities] = useState<HomeLocationItem[]>(MOCK_CITIES);
  const [districts, setDistricts] =
    useState<HomeLocationItem[]>(MOCK_DISTRICTS);

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
          mapLocationToHomeItem(p, locationImage(p), "استان"),
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
      setProvinces(MOCK_PROVINCES_EXTENDED);
      setCities(MOCK_CITIES);
      setDistricts(MOCK_DISTRICTS);
    }
  }, []);

  const loadClubs = useCallback(
    async (filterId: ClubDiscoveryFilterId) => {
      setIsLoading(true);
      const filter = CLUB_DISCOVERY_FILTERS.find((f) => f.id === filterId);
      const hasScopedQuery = Boolean(locationId || sportId);
      const query: DiscoveryClubsQuery = {
        page_size: 40,
        ...(filter?.query ?? {}),
        ...(locationId ? { locationId } : {}),
        ...(sportId ? { sportId } : {}),
      };

      try {
        const page = await discoveryClubs.list(query);
        if (page.result.length === 0 && filterId === "all" && !hasScopedQuery) {
          setClubs(BROWSE_CLUBS);
          setSource("mock");
        } else {
          setClubs(
            page.result.map((club) => mapDiscoveryClubToBrowse(club as never)),
          );
          setSource("api");
        }
      } catch {
        setClubs(hasScopedQuery ? [] : BROWSE_CLUBS);
        setSource("mock");
      } finally {
        setIsLoading(false);
      }
    },
    [locationId, sportId],
  );

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    void loadClubs(activeFilter);
  }, [activeFilter, loadClubs]);

  return {
    clubs,
    filters: CLUB_DISCOVERY_FILTERS,
    activeFilter,
    isLoading,
    source,
    provinces,
    cities,
    districts,
    setActiveFilter,
  };
}
