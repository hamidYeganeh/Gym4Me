"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiscoveryCoachesQuery } from "@repo/api/discovery";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  basicsLocations,
  discoveryCoaches,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  BROWSE_COACHES,
  filterBrowseCoaches,
  type BrowseCoach,
} from "./coaches-browse-data";
import {
  COACH_DISCOVERY_FILTERS,
  matchCoachDiscoveryFilterFromQuery,
  type CoachDiscoveryFilter,
  type CoachDiscoveryFilterId,
} from "./coach-discovery-filters";
import {
  MOCK_CITIES,
  MOCK_DISTRICTS,
  MOCK_PROVINCES_EXTENDED,
  mapLocationToHomeItem,
  type HomeLocationItem,
} from "./home-browse-data";
import { mapDiscoveryCoachToBrowse } from "./map-discovery-coach";

export type DiscoveryCoachesBrowseOptions = {
  specialtyKey?: string | null;
  cityId?: string | null;
  availability?: string | null;
  verified?: string | null;
  fresh?: string | null;
};

export type DiscoveryCoachesBrowseState = {
  coaches: BrowseCoach[];
  filters: CoachDiscoveryFilter[];
  activeFilter: CoachDiscoveryFilterId;
  isLoading: boolean;
  source: "api" | "mock";
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  setActiveFilter: (id: CoachDiscoveryFilterId) => void;
};

function locationImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function useDiscoveryCoachesBrowse(
  options: DiscoveryCoachesBrowseOptions = {},
): DiscoveryCoachesBrowseState {
  const specialtyKey = options.specialtyKey ?? undefined;
  const cityId = options.cityId ?? undefined;
  const availability = options.availability ?? undefined;
  const verified = options.verified ?? undefined;
  const fresh = options.fresh ?? undefined;

  const initialFilter = matchCoachDiscoveryFilterFromQuery({
    specialtyKey,
    availability,
    verified,
    fresh,
  });

  const [activeFilter, setActiveFilter] =
    useState<CoachDiscoveryFilterId>(initialFilter);
  const [coaches, setCoaches] = useState<BrowseCoach[]>(BROWSE_COACHES);
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
        .map((p) => mapLocationToHomeItem(p, locationImage(p), "استان"));
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

  const loadCoaches = useCallback(
    async (filterId: CoachDiscoveryFilterId) => {
      setIsLoading(true);
      const filter = COACH_DISCOVERY_FILTERS.find((f) => f.id === filterId);
      const scopedFromUrl = {
        ...(cityId ? { cityId } : {}),
        ...(specialtyKey && filterId === "all" ? { specialtyKey } : {}),
      };
      const hasScopedQuery =
        Object.keys(scopedFromUrl).length > 0 ||
        Boolean(availability || verified || fresh);
      const query: DiscoveryCoachesQuery = {
        page_size: 40,
        ...scopedFromUrl,
        ...(filter?.query?.specialtyKey
          ? { specialtyKey: filter.query.specialtyKey }
          : {}),
      };

      try {
        const page = await discoveryCoaches.list(query);
        if (page.result.length === 0 && filterId === "all" && !hasScopedQuery) {
          setCoaches(BROWSE_COACHES);
          setSource("mock");
        } else if (page.result.length === 0) {
          setCoaches(filterBrowseCoaches(BROWSE_COACHES, filterId));
          setSource("mock");
        } else {
          const mapped = page.result.map(mapDiscoveryCoachToBrowse);
          setCoaches(filterBrowseCoaches(mapped, filterId));
          setSource("api");
        }
      } catch {
        setCoaches(
          hasScopedQuery
            ? filterBrowseCoaches(BROWSE_COACHES, filterId)
            : BROWSE_COACHES,
        );
        setSource("mock");
      } finally {
        setIsLoading(false);
      }
    },
    [availability, cityId, fresh, specialtyKey, verified],
  );

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    void loadCoaches(activeFilter);
  }, [activeFilter, loadCoaches]);

  return {
    coaches,
    filters: COACH_DISCOVERY_FILTERS,
    activeFilter,
    isLoading,
    source,
    provinces,
    cities,
    districts,
    setActiveFilter,
  };
}
