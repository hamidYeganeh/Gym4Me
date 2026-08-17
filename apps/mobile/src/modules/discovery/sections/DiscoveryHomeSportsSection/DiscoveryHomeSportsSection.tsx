"use client";

import { SportCard } from "@repo/ui/cards/SportCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import {
  HOME_SPORT_THEMES,
  discoveryHomeSportsSectionVariants,
} from "./DiscoveryHomeSportsSection.styles";
import type { DiscoveryHomeSportsSectionProps } from "./DiscoveryHomeSportsSection.types";

export function DiscoveryHomeSportsSection({
  sports,
}: DiscoveryHomeSportsSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeSportsSectionVariants();

  if (sports.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("sportsTitle")}
      hint={t("sportsHint")}
      seeAllLabel={t("seeAll")}
      scrollerClassName={slots.scroller()}
      title={t("sportsTitle")}
      onSeeAll={() => router.push("/discovery/sports")}
    >
      {sports.slice(0, 5).map((sport, index) => {
        const theme = HOME_SPORT_THEMES[index % HOME_SPORT_THEMES.length]!;
        return (
          <SportCard
            actionColor={theme.actionColor}
            actionForegroundColor={theme.actionForegroundColor}
            actionLabel={t("viewSport")}
            className={index === 0 ? slots.cardFeatured() : slots.card()}
            color={theme.color}
            foregroundColor={theme.foregroundColor}
            key={sport.id}
            size="sm"
            sport={{
              title: sport.name,
              subtitle: sport.description ?? t("sportLabel"),
              backgroundImage: sport.image,
            }}
            onPress={() => router.push(`/discovery/sports/${sport.id}`)}
          />
        );
      })}
    </DiscoverySectionRail>
  );
}
