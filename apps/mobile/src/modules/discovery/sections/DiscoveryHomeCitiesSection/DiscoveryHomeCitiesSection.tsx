"use client";

import { CityCard } from "@repo/ui/cards/CityCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeCitiesSectionVariants } from "./DiscoveryHomeCitiesSection.styles";
import type { DiscoveryHomeCitiesSectionProps } from "./DiscoveryHomeCitiesSection.types";

export function DiscoveryHomeCitiesSection({
  cities,
}: DiscoveryHomeCitiesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeCitiesSectionVariants();

  if (cities.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("citiesTitle")}
      hint={t("citiesHint")}
      seeAllLabel={t("seeAll")}
      title={t("citiesTitle")}
      onSeeAll={() => router.push("/discovery/clubs")}
    >
      {cities.map((city) => (
        <CityCard
          actionLabel={t("viewCityClubs")}
          city={city.name}
          className={slots.card()}
          image={city.image || PLACEHOLDER_IMAGE}
          imageAlt={city.name}
          key={city.id}
          onAction={() =>
            router.push(
              `/discovery/clubs?locationId=${encodeURIComponent(city.id)}`,
            )
          }
          size="md"
        />
      ))}
    </DiscoverySectionRail>
  );
}
