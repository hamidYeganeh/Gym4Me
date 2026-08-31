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
  COACH_DISCOVERY_FILTERS,
  matchCoachDiscoveryFilterFromQuery,
  type CoachDiscoveryFilter,
  type CoachDiscoveryFilterId,
} from "./coach-discovery-filters";
import {
  mapLocationToHomeItem,
  type HomeLocationItem,
} from "./home-browse-data";
import { mapDiscoveryCoachToBrowse } from "./map-discovery-coach";
import { filterBrowseCoaches, type BrowseCoach } from "./coaches-browse-data";

export type DiscoveryCoachesBrowseOptions = {
  coachType?: string | null;
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
  isError: boolean;
  source: "api" | "mock";
  provinces: HomeLocationItem[];
  cities: HomeLocationItem[];
  districts: HomeLocationItem[];
  setActiveFilter: (id: CoachDiscoveryFilterId) => void;
  retry: () => void;
};

function locationImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function useDiscoveryCoachesBrowse(
  options: DiscoveryCoachesBrowseOptions = {},
): DiscoveryCoachesBrowseState {
  const coachType = options.coachType ?? undefined;
  const cityId = options.cityId ?? undefined;
  const availability = options.availability ?? undefined;
  const verified = options.verified ?? undefined;
  const fresh = options.fresh ?? undefined;

  const initialFilter = matchCoachDiscoveryFilterFromQuery({
    coachType,
    availability,
    verified,
    fresh,
  });

  const [activeFilter, setActiveFilter] =
    useState<CoachDiscoveryFilterId>(initialFilter);
  const [coaches, setCoaches] = useState<BrowseCoach[]>([]);
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

  const loadCoaches = useCallback(
    async (filterId: CoachDiscoveryFilterId) => {
      setIsLoading(true);
      setIsError(false);
      const filter = COACH_DISCOVERY_FILTERS.find((f) => f.id === filterId);
      const scopedFromUrl = {
        ...(cityId ? { cityId } : {}),
        ...(coachType && filterId === "all"
          ? { coachType: coachType as DiscoveryCoachesQuery["coachType"] }
          : {}),
      };
      const query: DiscoveryCoachesQuery = {
        page_size: 40,
        ...scopedFromUrl,
        ...(filter?.query?.coachType
          ? {
              coachType: filter.query
                .coachType as DiscoveryCoachesQuery["coachType"],
            }
          : {}),
        ...(filter?.query?.availability
          ? { availability: filter.query.availability }
          : {}),
        ...(filter?.query?.verified
          ? { verified: filter.query.verified }
          : {}),
        ...(filter?.query?.fresh ? { fresh: filter.query.fresh } : {}),
      };

      try {
        const page = await discoveryCoaches.list(query);
        const mapped = page.result.map(mapDiscoveryCoachToBrowse);
        setCoaches(filterBrowseCoaches(mapped, filterId));
        setSource("api");
      } catch {
        setCoaches([]);
        setIsError(true);
        setSource("api");
      } finally {
        setIsLoading(false);
      }
    },
    [cityId, coachType],
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
    isError,
    source,
    provinces,
    cities,
    districts,
    setActiveFilter,
    retry: () => void loadCoaches(activeFilter),
  };
}
