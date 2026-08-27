"use client";

import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoveryClubRailCard } from "../../components/DiscoveryClubRailCard";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeClubsRailSectionVariants } from "./DiscoveryHomeClubsRailSection.styles";
import type { DiscoveryHomeClubsRailSectionProps } from "./DiscoveryHomeClubsRailSection.types";

const CLUB_SKELETON_COUNT = 2;

export function DiscoveryHomeClubsRailSection({
  clubs,
  title,
  hint,
  ariaLabel,
  seeAllHref,
  seeAllLabel,
  seeAllVariant,
  orientation = "vertical",
  keyPrefix,
  isLoading = false,
  tone = "surface",
  pattern = false,
}: DiscoveryHomeClubsRailSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeClubsRailSectionVariants();

  if (!isLoading && clubs.length === 0) return null;

  const slideClass =
    orientation === "horizontal"
      ? slots.slideHorizontal()
      : slots.slideVertical();

  return (
    <DiscoverySectionRail
      ariaLabel={ariaLabel}
      hint={hint}
      pattern={pattern}
      seeAllLabel={seeAllHref ? (seeAllLabel ?? t("seeAll")) : undefined}
      seeAllVariant={seeAllVariant}
      sheet
      slideClassName={slideClass}
      title={title}
      tone={tone}
      onSeeAll={seeAllHref ? () => router.push(seeAllHref) : undefined}
    >
      {isLoading
        ? Array.from({ length: CLUB_SKELETON_COUNT }, (_, index) => (
            <ClubCardSkeleton
              className={slots.card()}
              key={`${keyPrefix}-skeleton-${index}`}
              orientation={orientation}
            />
          ))
        : clubs.map((club) => (
            <DiscoveryClubRailCard
              actionLabel={t("viewClub")}
              className={slots.card()}
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
