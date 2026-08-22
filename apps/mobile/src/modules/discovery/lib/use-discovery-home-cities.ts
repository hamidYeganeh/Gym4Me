"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { basicsLocations, mediaFileUrl } from "@/shared/lib/api";
import {
  mapLocationToHomeItem,
  type HomeLocationItem,
} from "./home-browse-data";

const MAX_HOME_CITIES = 12;

/** Featured cities shown first on `/discovery` when present. */
const PREFERRED_CITY_SLUGS = [
  "tehran-city",
  "isfahan-city",
  "mashhad",
  "shiraz",
  "tabriz",
  "karaj",
  "qom",
  "ahvaz",
] as const;

export type DiscoveryHomeCitiesState = {
  cities: HomeLocationItem[];
  isLoading: boolean;
};

function cityImage(node: { coverMediaId: string | null }) {
  return mediaFileUrl(node.coverMediaId) ?? PLACEHOLDER_IMAGE;
}

export function pickHomeCities(
  cities: readonly HomeLocationItem[],
): HomeLocationItem[] {
  const bySlug = new Map(cities.map((city) => [city.slug, city]));
  const picked: HomeLocationItem[] = [];
  const seen = new Set<string>();

  for (const slug of PREFERRED_CITY_SLUGS) {
    const city = bySlug.get(slug);
    if (!city || seen.has(city.id)) continue;
    picked.push(city);
    seen.add(city.id);
  }

  const rest = cities.filter((city) => !seen.has(city.id));
  return [...picked, ...rest].slice(0, MAX_HOME_CITIES);
}

export function useDiscoveryHomeCities(): DiscoveryHomeCitiesState {
  const [state, setState] = useState<DiscoveryHomeCitiesState>({
    cities: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const countries = await basicsLocations.listCountries();
        if (cancelled) return;

        const iran =
          countries.result.find((country) => country.slug === "iran") ??
          countries.result[0];
        if (!iran) {
          setState({ cities: [], isLoading: false });
          return;
        }

        const provinces = await basicsLocations.listProvinces(iran.id);
        if (cancelled) return;

        const batches = await Promise.all(
          provinces.result.map((province) =>
            basicsLocations.listCities(province.id).catch(() => null),
          ),
        );
        if (cancelled) return;

        const cityMap = new Map<string, HomeLocationItem>();
        for (const batch of batches) {
          if (!batch) continue;
          for (const city of batch.result) {
            if (!city.isActive) continue;
            cityMap.set(
              city.id,
              mapLocationToHomeItem(city, cityImage(city)),
            );
          }
        }

        setState({
          cities: pickHomeCities([...cityMap.values()]),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ cities: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
