"use client";

import {
  PopularLocationCard,
  PopularLocationCardSkeleton,
} from "@repo/ui/cards/PopularLocationCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { HomeLocationKind } from "../../lib/home-browse-data";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryPopularLocationsSectionVariants } from "./DiscoveryPopularLocationsSection.styles";
import type { DiscoveryPopularLocationsSectionProps } from "./DiscoveryPopularLocationsSection.types";

const LOCATION_SKELETON_COUNT = 4;
const DEFAULT_MAX_ITEMS = 8;

type LocationCopyKeys = {
  titleKey: "provincesTitle" | "citiesTitle" | "districtsTitle" | "popularLocationsTitle";
  hintKey: "provincesHint" | "citiesHint" | "districtsHint" | "popularLocationsHint";
  eyebrowKey:
    | "locationEyebrowProvince"
    | "locationEyebrowCity"
    | "locationEyebrowDistrict"
    | "coachEyebrowProvince"
    | "coachEyebrowCity"
    | "coachEyebrowDistrict";
  viewKey: "viewProvince" | "viewCityClubs" | "viewDistrict" | "viewCityCoaches";
};

const CLUB_LOCATION_COPY: Record<HomeLocationKind, Omit<LocationCopyKeys, "eyebrowKey">> & {
  eyebrowKey: LocationCopyKeys["eyebrowKey"];
} = {
  province: {
    titleKey: "provincesTitle",
    hintKey: "provincesHint",
    eyebrowKey: "locationEyebrowProvince",
    viewKey: "viewProvince",
  },
  city: {
    titleKey: "citiesTitle",
    hintKey: "citiesHint",
    eyebrowKey: "locationEyebrowCity",
    viewKey: "viewCityClubs",
  },
  district: {
    titleKey: "districtsTitle",
    hintKey: "districtsHint",
    eyebrowKey: "locationEyebrowDistrict",
    viewKey: "viewDistrict",
  },
};

const COACH_LOCATION_COPY: Record<HomeLocationKind, LocationCopyKeys> = {
  province: {
    titleKey: "provincesTitle",
    hintKey: "provincesHint",
    eyebrowKey: "coachEyebrowProvince",
    viewKey: "viewProvince",
  },
  city: {
    titleKey: "citiesTitle",
    hintKey: "citiesHint",
    eyebrowKey: "coachEyebrowCity",
    viewKey: "viewCityCoaches",
  },
  district: {
    titleKey: "districtsTitle",
    hintKey: "districtsHint",
    eyebrowKey: "coachEyebrowDistrict",
    viewKey: "viewDistrict",
  },
};

function resolveKind(
  item: DiscoveryPopularLocationsSectionProps["locations"][number],
  fallback: HomeLocationKind,
): HomeLocationKind {
  return item.kind ?? fallback;
}

export function DiscoveryPopularLocationsSection({
  locations,
  kind = "city",
  target = "clubs",
  title,
  hint,
  ariaLabel,
  isLoading = false,
  seeAllHref,
  seeAllLabel,
  maxItems = DEFAULT_MAX_ITEMS,
}: DiscoveryPopularLocationsSectionProps) {
  const tHome = useTranslations("DiscoveryHome");
  const tClubs = useTranslations("DiscoveryClubs");
  const tCoaches = useTranslations("DiscoveryCoaches");
  const router = useRouter();
  const slots = discoveryPopularLocationsSectionVariants();
  const copy =
    target === "coaches"
      ? COACH_LOCATION_COPY[kind]
      : CLUB_LOCATION_COPY[kind];
  const tSection = target === "coaches" ? tCoaches : tHome;
  const tTarget = target === "coaches" ? tCoaches : tClubs;

  const resolvedTitle = title ?? tSection(copy.titleKey);
  const resolvedHint = hint ?? tSection(copy.hintKey);
  const resolvedAriaLabel = ariaLabel ?? resolvedTitle;
  const visibleLocations = locations.slice(0, maxItems);

  if (!isLoading && visibleLocations.length === 0) return null;

  const openLocation = (id: string) => {
    router.push(
      `/discovery/${target}?locationId=${encodeURIComponent(id)}`,
    );
  };

  return (
    <DiscoverySectionRail
      accent={false}
      ariaLabel={resolvedAriaLabel}
      hint={resolvedHint}
      onSeeAll={seeAllHref ? () => router.push(seeAllHref) : undefined}
      seeAllLabel={seeAllHref ? (seeAllLabel ?? tHome("seeAll")) : undefined}
      sheet
      slideClassName={slots.slide()}
      spaceBetween={16}
      title={resolvedTitle}
      tone="surface"
    >
      {isLoading
        ? Array.from({ length: LOCATION_SKELETON_COUNT }, (_, index) => (
            <PopularLocationCardSkeleton key={`popular-location-skeleton-${index}`} />
          ))
        : visibleLocations.map((location) => {
            const itemKind = resolveKind(location, kind);
            const itemCopy =
              target === "coaches"
                ? COACH_LOCATION_COPY[itemKind]
                : CLUB_LOCATION_COPY[itemKind];

            return (
              <PopularLocationCard
                actionLabel={tTarget(itemCopy.viewKey, { name: location.name })}
                countLabel={
                  location.count != null
                    ? tHome("clubCount", {
                        count: location.count.toLocaleString("fa-IR"),
                      })
                    : undefined
                }
                eyebrow={tHome(itemCopy.eyebrowKey)}
                image={location.image || PLACEHOLDER_IMAGE}
                imageAlt={location.name}
                key={location.id}
                name={location.name}
                onPress={() => openLocation(location.id)}
              />
            );
          })}
    </DiscoverySectionRail>
  );
}
