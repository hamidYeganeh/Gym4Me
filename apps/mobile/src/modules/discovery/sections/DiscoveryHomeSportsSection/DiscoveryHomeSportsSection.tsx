"use client";

import { SportCard, SportCardSkeleton } from "@repo/ui/cards/SportCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoverySportIcon } from "../../lib/discovery-home-icons";
import { homeSportTheme, sportHomeHref } from "../../lib/sports-home";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeSportsSectionVariants } from "./DiscoveryHomeSportsSection.styles";
import type { DiscoveryHomeSportsSectionProps } from "./DiscoveryHomeSportsSection.types";

const SPORT_SKELETON_COUNT = 3;
const SPORT_ICON_SIZE = 28;

export function DiscoveryHomeSportsSection({
  sports,
  isLoading = false,
  title,
  hint,
  seeAllHref = "/discovery/sports",
}: DiscoveryHomeSportsSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeSportsSectionVariants();

  if (!isLoading && sports.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={title ?? t("sportsTitle")}
      hint={hint ?? t("sportsHint")}
      pattern
      seeAllLabel={t("seeAll")}
      sheet
      slideClassName={slots.slide()}
      title={title ?? t("sportsTitle")}
      tone="accent"
      onSeeAll={() => router.push(seeAllHref)}
    >
      {isLoading
        ? Array.from({ length: SPORT_SKELETON_COUNT }, (_, index) => (
            <SportCardSkeleton
              className={slots.card()}
              key={`sport-skeleton-${index}`}
              size="sm"
            />
          ))
        : sports.map((sport, index) => {
            const theme = homeSportTheme(index);
            return (
              <SportCard
                actionColor={theme.actionColor}
                actionForegroundColor={theme.actionForegroundColor}
                actionLabel={t("viewSport")}
                className={slots.card()}
                color={theme.color}
                foregroundColor={theme.foregroundColor}
                key={sport.id}
                size="sm"
                sport={{
                  title: sport.name,
                  subtitle: sport.description ?? t("sportLabel"),
                  backgroundImage: sport.image,
                  icon: discoverySportIcon(sport.iconKey, SPORT_ICON_SIZE),
                }}
                onPress={() => router.push(sportHomeHref(sport.id))}
              />
            );
          })}
    </DiscoverySectionRail>
  );
}
