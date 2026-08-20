"use client";

import { CityCard } from "@repo/ui/cards/CityCard";
import { DistrictCard } from "@repo/ui/cards/DistrictCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryBrowseClubsLocationsSectionVariants } from "./DiscoveryBrowseClubsLocationsSection.styles";
import type {
  DiscoveryBrowseClubsLocationVariant,
  DiscoveryBrowseClubsLocationsSectionProps,
} from "./DiscoveryBrowseClubsLocationsSection.types";

type LocationConfig = {
  titleKey: string;
  hintKey: string;
};

const LOCATION_CONFIG: Record<
  DiscoveryBrowseClubsLocationVariant,
  LocationConfig
> = {
  provinces: { titleKey: "provincesTitle", hintKey: "provincesHint" },
  cities: { titleKey: "citiesTitle", hintKey: "citiesHint" },
  districts: { titleKey: "districtsTitle", hintKey: "districtsHint" },
};

export function DiscoveryBrowseClubsLocationsSection({
  variant,
  items,
}: DiscoveryBrowseClubsLocationsSectionProps) {
  const t = useTranslations("DiscoveryClubs");
  const router = useRouter();
  const slots = discoveryBrowseClubsLocationsSectionVariants();
  const config = LOCATION_CONFIG[variant];

  if (items.length === 0) return null;

  const openLocation = (id: string) => {
    router.push(`/discovery/clubs?locationId=${encodeURIComponent(id)}`);
  };

  return (
    <DiscoverySectionRail
      accent={false}
      ariaLabel={t(config.titleKey)}
      hint={t(config.hintKey)}
      scrollerClassName={slots.scroller()}
      title={t(config.titleKey)}
      titleSize="h4"
    >
      {variant === "cities"
        ? items.map((city) => (
            <CityCard
              actionLabel={t("viewCityClubs")}
              city={city.name}
              className={slots.locationCard()}
              image={city.image || PLACEHOLDER_IMAGE}
              imageAlt={city.name}
              key={city.id}
              onAction={() => openLocation(city.id)}
              size="md"
            />
          ))
        : items.map((item) => (
            <DistrictCard
              actionLabel={
                variant === "provinces" ? t("viewProvince") : t("viewDistrict")
              }
              className={slots.locationCard()}
              image={item.image || PLACEHOLDER_IMAGE}
              imageAlt={item.name}
              key={item.id}
              onPress={() => openLocation(item.id)}
              size={variant === "provinces" ? "md" : "sm"}
              subtitle={
                item.subtitle ??
                t(variant === "provinces" ? "provinceLabel" : "districtLabel")
              }
              title={item.name}
            />
          ))}
    </DiscoverySectionRail>
  );
}
