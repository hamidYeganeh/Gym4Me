"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useMemo } from "react";
import { DiscoveryCoachRailCard } from "../../components/DiscoveryCoachRailCard";
import {
  coachesAvailableInPerson,
  coachesAvailableRemote,
  coachesNearby,
  sortCoachesByRating,
  type BrowseCoach,
} from "../../lib/coaches-browse-data";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryBrowseCoachesRailSectionVariants } from "./DiscoveryBrowseCoachesRailSection.styles";
import type {
  DiscoveryBrowseCoachesRailSectionProps,
  DiscoveryBrowseCoachesRailVariant,
} from "./DiscoveryBrowseCoachesRailSection.types";

type RailConfig = {
  titleKey: string;
  hintKey: string;
  orientation: "horizontal" | "vertical" | "fullWidth";
  keyPrefix: string;
  selectCoaches: (coaches: BrowseCoach[]) => BrowseCoach[];
};

const RAIL_CONFIG: Record<DiscoveryBrowseCoachesRailVariant, RailConfig> = {
  featured: {
    titleKey: "featuredTitle",
    hintKey: "featuredHint",
    orientation: "fullWidth",
    keyPrefix: "featured",
    selectCoaches: (coaches) => sortCoachesByRating(coaches).slice(0, 4),
  },
  nearby: {
    titleKey: "nearbyTitle",
    hintKey: "nearbyHint",
    orientation: "vertical",
    keyPrefix: "nearby",
    selectCoaches: (coaches) => coachesNearby(coaches).slice(0, 8),
  },
  remote: {
    titleKey: "remoteTitle",
    hintKey: "remoteHint",
    orientation: "horizontal",
    keyPrefix: "remote",
    selectCoaches: (coaches) => coachesAvailableRemote(coaches).slice(0, 8),
  },
  inPerson: {
    titleKey: "inPersonTitle",
    hintKey: "inPersonHint",
    orientation: "vertical",
    keyPrefix: "in-person",
    selectCoaches: (coaches) => coachesAvailableInPerson(coaches).slice(0, 8),
  },
  topRated: {
    titleKey: "topRatedTitle",
    hintKey: "topRatedHint",
    orientation: "vertical",
    keyPrefix: "top",
    selectCoaches: (coaches) => sortCoachesByRating(coaches).slice(0, 8),
  },
  picks: {
    titleKey: "picksTitle",
    hintKey: "picksHint",
    orientation: "horizontal",
    keyPrefix: "pick",
    selectCoaches: (coaches) => coaches.slice(0, 6),
  },
};

export function DiscoveryBrowseCoachesRailSection({
  variant,
  coaches,
}: DiscoveryBrowseCoachesRailSectionProps) {
  const t = useTranslations("DiscoveryCoaches");
  const router = useRouter();
  const slots = discoveryBrowseCoachesRailSectionVariants();
  const config = RAIL_CONFIG[variant];

  const items = useMemo(() => config.selectCoaches(coaches), [coaches, config]);

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
      {items.map((coach) => (
        <DiscoveryCoachRailCard
          actionLabel={t("viewCoach")}
          className={slots.card()}
          coach={coach}
          favoriteLabel={t("favoriteLabel")}
          key={`${config.keyPrefix}-${coach.id}`}
          orientation={config.orientation}
          pricePrefix={t("pricePrefix")}
          priceSuffix={t("priceSuffix")}
          shareLabel={t("shareLabel")}
          onOpen={() => router.push(`/discovery/coaches/${coach.id}`)}
        />
      ))}
    </DiscoverySectionRail>
  );
}
