"use client";

import { CityCard } from "@repo/ui/cards/CityCard";
import { DistrictCard } from "@repo/ui/cards/DistrictCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryBrowseCoachesLocationsSectionVariants } from "./DiscoveryBrowseCoachesLocationsSection.styles";
import type {
  DiscoveryBrowseCoachesLocationVariant,
  DiscoveryBrowseCoachesLocationsSectionProps,
} from "./DiscoveryBrowseCoachesLocationsSection.types";

type LocationConfig = {
  titleKey: string;
  hintKey: string;
};

const LOCATION_CONFIG: Record<
  DiscoveryBrowseCoachesLocationVariant,
  LocationConfig
> = {
  provinces: { titleKey: "provincesTitle", hintKey: "provincesHint" },
  cities: { titleKey: "citiesTitle", hintKey: "citiesHint" },
  districts: { titleKey: "districtsTitle", hintKey: "districtsHint" },
};

export function DiscoveryBrowseCoachesLocationsSection({
  variant,
  items,
}: DiscoveryBrowseCoachesLocationsSectionProps) {
  const t = useTranslations("DiscoveryCoaches");
  const router = useRouter();
  const slots = discoveryBrowseCoachesLocationsSectionVariants();
  const config = LOCATION_CONFIG[variant];

  if (items.length === 0) return null;

  const openLocation = (id: string) => {
    router.push(`/discovery/coaches?cityId=${encodeURIComponent(id)}`);
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
              actionLabel={t("viewCityCoaches")}
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
