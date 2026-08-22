"use client";

import { CityCard, CityCardSkeleton } from "@repo/ui/cards/CityCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeCitiesSectionVariants } from "./DiscoveryHomeCitiesSection.styles";
import type { DiscoveryHomeCitiesSectionProps } from "./DiscoveryHomeCitiesSection.types";

const CITY_SKELETON_COUNT = 4;

export function DiscoveryHomeCitiesSection({
  cities,
  isLoading = false,
  seeAllHref = "/discovery/clubs",
}: DiscoveryHomeCitiesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeCitiesSectionVariants();

  if (!isLoading && cities.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("citiesTitle")}
      hint={t("citiesHint")}
      seeAllLabel={seeAllHref ? t("seeAll") : undefined}
      sheet
      slideClassName={slots.slide()}
      title={t("citiesTitle")}
      tone="surface"
      onSeeAll={seeAllHref ? () => router.push(seeAllHref) : undefined}
    >
      {isLoading
        ? Array.from({ length: CITY_SKELETON_COUNT }, (_, index) => (
            <CityCardSkeleton
              className={slots.card()}
              key={`city-skeleton-${index}`}
              size="md"
            />
          ))
        : cities.map((city) => (
            <CityCard
              actionLabel={t("viewCityClubs")}
              city={city.name}
              className={slots.card()}
              image={city.image || PLACEHOLDER_IMAGE}
              imageAlt={city.name}
              key={city.id}
              size="md"
              onAction={() =>
                router.push(
                  `/discovery/clubs?locationId=${encodeURIComponent(city.id)}`,
                )
              }
            />
          ))}
    </DiscoverySectionRail>
  );
}
