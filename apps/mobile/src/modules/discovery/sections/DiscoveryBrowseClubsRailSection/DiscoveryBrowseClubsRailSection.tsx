"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useMemo } from "react";
import { DiscoveryClubRailCard } from "../../components/DiscoveryClubRailCard";
import {
  clubsNearby,
  clubsOpenNow,
  sortClubsByRating,
  type BrowseClub,
} from "../../lib/clubs-browse-data";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryBrowseClubsRailSectionVariants } from "./DiscoveryBrowseClubsRailSection.styles";
import type {
  DiscoveryBrowseClubsRailSectionProps,
  DiscoveryBrowseClubsRailVariant,
} from "./DiscoveryBrowseClubsRailSection.types";

type RailConfig = {
  titleKey: string;
  hintKey: string;
  orientation: "horizontal" | "vertical" | "fullWidth";
  keyPrefix: string;
  selectClubs: (clubs: BrowseClub[]) => BrowseClub[];
};

const RAIL_CONFIG: Record<DiscoveryBrowseClubsRailVariant, RailConfig> = {
  featured: {
    titleKey: "featuredTitle",
    hintKey: "featuredHint",
    orientation: "fullWidth",
    keyPrefix: "featured",
    selectClubs: (clubs) => sortClubsByRating(clubs).slice(0, 4),
  },
  nearby: {
    titleKey: "nearbyTitle",
    hintKey: "nearbyHint",
    orientation: "vertical",
    keyPrefix: "nearby",
    selectClubs: (clubs) => clubsNearby(clubs).slice(0, 8),
  },
  openNow: {
    titleKey: "openNowTitle",
    hintKey: "openNowHint",
    orientation: "horizontal",
    keyPrefix: "open",
    selectClubs: (clubs) => clubsOpenNow(clubs).slice(0, 8),
  },
  topRated: {
    titleKey: "topRatedTitle",
    hintKey: "topRatedHint",
    orientation: "vertical",
    keyPrefix: "top",
    selectClubs: (clubs) => sortClubsByRating(clubs).slice(0, 8),
  },
  picks: {
    titleKey: "picksTitle",
    hintKey: "picksHint",
    orientation: "horizontal",
    keyPrefix: "pick",
    selectClubs: (clubs) => clubs.slice(0, 6),
  },
};

export function DiscoveryBrowseClubsRailSection({
  variant,
  clubs,
}: DiscoveryBrowseClubsRailSectionProps) {
  const t = useTranslations("DiscoveryClubs");
  const router = useRouter();
  const slots = discoveryBrowseClubsRailSectionVariants();
  const config = RAIL_CONFIG[variant];

  const items = useMemo(() => config.selectClubs(clubs), [clubs, config]);

  if (items.length === 0) return null;

  const slideClass =
    config.orientation === "fullWidth"
      ? slots.slideFullWidth()
      : config.orientation === "horizontal"
        ? slots.slideHorizontal()
        : slots.slideVertical();

  return (
    <DiscoverySectionRail
      accent={false}
      ariaLabel={t(config.titleKey)}
      hint={t(config.hintKey)}
      slideClassName={slideClass}
      title={t(config.titleKey)}
      titleSize="h4"
    >
      {items.map((club) => (
        <DiscoveryClubRailCard
          actionLabel={t("viewClub")}
          className={slots.card()}
          club={club}
          favoriteLabel={t("favoriteLabel")}
          key={`${config.keyPrefix}-${club.id}`}
          orientation={config.orientation}
          pricePrefix={t("pricePrefix")}
          priceSuffix={t("priceSuffix")}
          shareLabel={t("shareLabel")}
          onOpen={() => router.push(`/discovery/clubs/${club.id}`)}
        />
      ))}
    </DiscoverySectionRail>
  );
}
