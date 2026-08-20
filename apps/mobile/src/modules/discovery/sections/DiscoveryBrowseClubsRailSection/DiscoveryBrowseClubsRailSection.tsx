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
  scroller: "default" | "fullBleed";
  keyPrefix: string;
  selectClubs: (clubs: BrowseClub[]) => BrowseClub[];
};

const RAIL_CONFIG: Record<DiscoveryBrowseClubsRailVariant, RailConfig> = {
  featured: {
    titleKey: "featuredTitle",
    hintKey: "featuredHint",
    orientation: "fullWidth",
    scroller: "fullBleed",
    keyPrefix: "featured",
    selectClubs: (clubs) => sortClubsByRating(clubs).slice(0, 4),
  },
  nearby: {
    titleKey: "nearbyTitle",
    hintKey: "nearbyHint",
    orientation: "vertical",
    scroller: "default",
    keyPrefix: "nearby",
    selectClubs: (clubs) => clubsNearby(clubs).slice(0, 8),
  },
  openNow: {
    titleKey: "openNowTitle",
    hintKey: "openNowHint",
    orientation: "horizontal",
    scroller: "default",
    keyPrefix: "open",
    selectClubs: (clubs) => clubsOpenNow(clubs).slice(0, 8),
  },
  topRated: {
    titleKey: "topRatedTitle",
    hintKey: "topRatedHint",
    orientation: "vertical",
    scroller: "default",
    keyPrefix: "top",
    selectClubs: (clubs) => sortClubsByRating(clubs).slice(0, 8),
  },
  picks: {
    titleKey: "picksTitle",
    hintKey: "picksHint",
    orientation: "horizontal",
    scroller: "default",
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

  const cardClass =
    config.orientation === "fullWidth"
      ? slots.cardFullWidth()
      : config.orientation === "horizontal"
        ? slots.cardHorizontal()
        : slots.cardVertical();

  const scrollerClassName =
    config.scroller === "fullBleed"
      ? slots.fullBleedScroller()
      : slots.scroller();

  return (
    <DiscoverySectionRail
      accent={false}
      ariaLabel={t(config.titleKey)}
      hint={t(config.hintKey)}
      scrollerClassName={scrollerClassName}
      title={t(config.titleKey)}
      titleSize="h4"
    >
      {items.map((club) => (
        <DiscoveryClubRailCard
          actionLabel={t("viewClub")}
          className={cardClass}
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
