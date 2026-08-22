"use client";

import { useEffect, useState } from "react";
import type { LocationNode } from "@repo/api";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { basicsLocations, discoveryClubs } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";

import type { BrowseClub } from "./clubs-browse-data";
import {
  MAX_HOME_DISTRICT_CLUBS,
  addressFromUser,
  matchDistrictFromAddress,
  matchLocationByName,
  resolveDiscoveryArea,
  type ResolvedDiscoveryArea,
  type UserDiscoveryAddress,
} from "./district-clubs-home";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";

export type DiscoveryHomeDistrictClubsState = {
  clubs: BrowseClub[];
  areaName: string | null;
  locationId: string | null;
  isLoading: boolean;
};

const EMPTY: DiscoveryHomeDistrictClubsState = {
  clubs: [],
  areaName: null,
  locationId: null,
  isLoading: false,
};

function activeNodes(nodes: readonly LocationNode[]): LocationNode[] {
  return nodes.filter((node) => node.isActive);
}

async function findCityByName(cityName: string): Promise<LocationNode | null> {
  const countries = await basicsLocations.listCountries();
  const iran =
    countries.result.find((country) => country.slug === "iran") ??
    countries.result[0];
  if (!iran) return null;

  const provinces = await basicsLocations.listProvinces(iran.id);
  const batches = await Promise.all(
    provinces.result.map((province) =>
      basicsLocations.listCities(province.id).catch(() => null),
    ),
  );
  const cities = batches.flatMap((batch) =>
    batch ? activeNodes(batch.result) : [],
  );
  return matchLocationByName(cities, cityName);
}

async function resolveUserArea(
  address: UserDiscoveryAddress,
): Promise<ResolvedDiscoveryArea | null> {
  let city: LocationNode | null = null;

  if (address.provinceId) {
    try {
      const cities = await basicsLocations.listCities(address.provinceId);
      city = matchLocationByName(activeNodes(cities.result), address.city);
    } catch {
      city = null;
    }
  }

  if (!city && address.city) {
    city = await findCityByName(address.city);
  }

  if (!city) return null;

  let district: LocationNode | null = null;
  try {
    const districts = await basicsLocations.listDistricts(city.id);
    district = matchDistrictFromAddress(activeNodes(districts.result), address);
  } catch {
    district = null;
  }

  return resolveDiscoveryArea({ city, district });
}

export function useDiscoveryHomeDistrictClubs(): DiscoveryHomeDistrictClubsState {
  const { user } = useAuth();
  const [state, setState] = useState<DiscoveryHomeDistrictClubsState>({
    clubs: [],
    areaName: null,
    locationId: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const address = addressFromUser(user);
      if (!address) {
        if (!cancelled) setState(EMPTY);
        return;
      }

      try {
        const area = await resolveUserArea(address);
        if (cancelled) return;
        if (!area) {
          setState(EMPTY);
          return;
        }

        const query: DiscoveryClubsQuery = {
          page_size: MAX_HOME_DISTRICT_CLUBS,
          locationId: area.locationId,
        };
        const page = await discoveryClubs.list(query);
        if (cancelled) return;

        setState({
          clubs: page.result.map((club) =>
            mapDiscoveryClubToBrowse(club as never),
          ),
          areaName: area.name,
          locationId: area.locationId,
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState(EMPTY);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
