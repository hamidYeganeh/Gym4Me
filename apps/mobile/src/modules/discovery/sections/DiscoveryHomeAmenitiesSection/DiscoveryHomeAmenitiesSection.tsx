"use client";

import { Button } from "@heroui/react/button";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryAmenityIcon } from "../../lib/discovery-home-icons";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeAmenitiesSectionVariants } from "./DiscoveryHomeAmenitiesSection.styles";
import type { DiscoveryHomeAmenitiesSectionProps } from "./DiscoveryHomeAmenitiesSection.types";

export function DiscoveryHomeAmenitiesSection({
  amenities,
}: DiscoveryHomeAmenitiesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeAmenitiesSectionVariants();

  if (amenities.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("amenitiesTitle")}
      hint={t("amenitiesHint")}
      title={t("amenitiesTitle")}
    >
      {amenities.map((amenity) => (
        <Button
          aria-label={amenity.name}
          className={slots.card()}
          key={amenity.id}
          variant="ghost"
          onPress={() =>
            router.push(
              `/discovery/clubs?amenitySlug=${encodeURIComponent(amenity.slug)}`,
            )
          }
        >
          <ClubAmenityCard
            className="w-full"
            icon={discoveryAmenityIcon(amenity.iconKey)}
            subtitle={amenity.subtitle}
            title={amenity.name}
          />
        </Button>
      ))}
    </DiscoverySectionRail>
  );
}
