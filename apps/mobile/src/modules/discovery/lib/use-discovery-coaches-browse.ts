"use client";

import { useEffect, useState } from "react";
import type { DiscoveryCoach } from "@repo/api/discovery";
import {
  COACH_SPECIALTIES,
  EXPERT_COACHES,
  FEATURED_COACHES,
  NEARBY_COACHES,
  POPULAR_COACHES,
  type ExpertCoach,
  type FeaturedCoach,
  type NearbyCoach,
  type PopularCoach,
  type CoachSpecialty,
} from "./coaches-browse-data";
import {
  mapDiscoveryCoachToExpert,
  mapDiscoveryCoachToFeatured,
  mapDiscoveryCoachToNearby,
  mapDiscoveryCoachToPopular,
} from "./map-discovery-coach";
import { discoveryCoaches } from "@/shared/lib/api";

type DiscoveryCoachesBrowseState = {
  specialties: CoachSpecialty[];
  featuredCoaches: FeaturedCoach[];
  popularCoaches: PopularCoach[];
  expertCoaches: ExpertCoach[];
  nearbyCoaches: NearbyCoach[];
  isLoading: boolean;
  isEmpty: boolean;
  source: "api" | "mock";
};

const MOCK_STATE: DiscoveryCoachesBrowseState = {
  specialties: COACH_SPECIALTIES,
  featuredCoaches: FEATURED_COACHES,
  popularCoaches: POPULAR_COACHES,
  expertCoaches: EXPERT_COACHES,
  nearbyCoaches: NEARBY_COACHES,
  isLoading: false,
  isEmpty: false,
  source: "mock",
};

function specialtiesFromCoaches(coaches: DiscoveryCoach[]): CoachSpecialty[] {
  const keys: string[] = [];
  for (const coach of coaches) {
    for (const key of coach.specialtyKeys) {
      if (key && !keys.includes(key)) keys.push(key);
    }
    if (coach.experience.headline && !keys.includes(coach.experience.headline)) {
      keys.push(coach.experience.headline);
    }
  }
  if (keys.length === 0) return COACH_SPECIALTIES;
  return keys.slice(0, 8).map((key) => ({ id: key, label: key }));
}

export function useDiscoveryCoachesBrowse(): DiscoveryCoachesBrowseState {
  const [state, setState] = useState<DiscoveryCoachesBrowseState>({
    ...MOCK_STATE,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const page = await discoveryCoaches.list({ page_size: 24 });
        if (cancelled) return;
        if (page.result.length === 0) {
          setState(MOCK_STATE);
          return;
        }

        const featured = page.result.slice(0, 6).map(mapDiscoveryCoachToFeatured);
        const popular = page.result.slice(0, 8).map(mapDiscoveryCoachToPopular);
        const expert = page.result
          .filter((c) => c.verification.status === "approved")
          .slice(0, 8)
          .map(mapDiscoveryCoachToExpert);
        const nearby = page.result.slice(0, 8).map(mapDiscoveryCoachToNearby);

        setState({
          specialties: specialtiesFromCoaches(page.result),
          featuredCoaches: featured,
          popularCoaches: popular,
          expertCoaches:
            expert.length > 0
              ? expert
              : featured.map((c) => ({
                  id: c.id,
                  name: c.name,
                  image: c.image,
                  isVerified: c.isCertified,
                })),
          nearbyCoaches: nearby,
          isLoading: false,
          isEmpty: false,
          source: "api",
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
