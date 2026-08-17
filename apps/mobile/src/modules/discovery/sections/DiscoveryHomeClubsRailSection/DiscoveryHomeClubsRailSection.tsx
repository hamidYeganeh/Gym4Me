"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryClubRailCard } from "../../components/DiscoveryClubRailCard";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeClubsRailSectionVariants } from "./DiscoveryHomeClubsRailSection.styles";
import type { DiscoveryHomeClubsRailSectionProps } from "./DiscoveryHomeClubsRailSection.types";

export function DiscoveryHomeClubsRailSection({
  clubs,
  title,
  hint,
  ariaLabel,
  seeAllHref,
  orientation = "vertical",
  keyPrefix,
}: DiscoveryHomeClubsRailSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeClubsRailSectionVariants();

  if (clubs.length === 0) return null;

  const cardClass =
    orientation === "horizontal"
      ? slots.cardHorizontal()
      : slots.cardVertical();

  return (
    <DiscoverySectionRail
      ariaLabel={ariaLabel}
      hint={hint}
      seeAllLabel={t("seeAll")}
      title={title}
      onSeeAll={() => router.push(seeAllHref)}
    >
      {clubs.map((club) => (
        <DiscoveryClubRailCard
          actionLabel={t("viewClub")}
          className={cardClass}
          club={club}
          favoriteLabel={t("favoriteLabel")}
          key={`${keyPrefix}-${club.id}`}
          orientation={orientation}
          shareLabel={t("shareLabel")}
          onOpen={() => router.push(`/discovery/clubs/${club.id}`)}
        />
      ))}
    </DiscoverySectionRail>
  );
}
