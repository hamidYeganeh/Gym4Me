"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ClubCardSkeleton } from "@repo/ui/cards/ClubCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoveryClubRailCard } from "../../components/DiscoveryClubRailCard";
import { discoverySectionRailVariants } from "../DiscoverySectionRail/DiscoverySectionRail.styles";
import { discoveryHomeClubsColumnSectionVariants } from "./DiscoveryHomeClubsColumnSection.styles";
import type { DiscoveryHomeClubsColumnSectionProps } from "./DiscoveryHomeClubsColumnSection.types";

const CLUB_SKELETON_COUNT = 3;

export function DiscoveryHomeClubsColumnSection({
  clubs,
  title,
  hint,
  ariaLabel,
  keyPrefix,
  isLoading = false,
  tone = "surface",
  seeAllHref,
  seeAllLabel,
  seeAllVariant = "ghost",
}: DiscoveryHomeClubsColumnSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const railSlots = discoverySectionRailVariants({
    accent: false,
    sheet: true,
    tone,
  });
  const slots = discoveryHomeClubsColumnSectionVariants();

  if (!isLoading && clubs.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className={railSlots.root()}>
      <div className={railSlots.header()}>
        <div className={railSlots.titleBlock()}>
          {title ? (
            <Typography className={railSlots.title()} type="h3" weight="bold">
              {title}
            </Typography>
          ) : null}
          {hint ? (
            <Typography className={railSlots.hint()} type="body-xs">
              {hint}
            </Typography>
          ) : null}
        </div>
        {seeAllHref ? (
          <Button
            className={railSlots.seeAll()}
            size="lg"
            variant={seeAllVariant}
            onPress={() => router.push(seeAllHref)}
          >
            {seeAllLabel ?? t("seeAll")}
          </Button>
        ) : null}
      </div>

      <div className={slots.list()}>
        {isLoading
          ? Array.from({ length: CLUB_SKELETON_COUNT }, (_, index) => (
              <ClubCardSkeleton
                className={slots.card()}
                key={`${keyPrefix}-skeleton-${index}`}
                orientation="listing"
              />
            ))
          : clubs.map((club) => (
              <DiscoveryClubRailCard
                className={slots.card()}
                club={club}
                favoriteLabel={t("favoriteLabel")}
                key={`${keyPrefix}-${club.id}`}
                orientation="listing"
                shareLabel={t("shareLabel")}
                statusClosedLabel={t("clubStatusClosed")}
                statusOpenLabel={t("clubStatusOpen")}
                onOpen={() => router.push(`/discovery/clubs/${club.id}`)}
              />
            ))}
      </div>
    </section>
  );
}
