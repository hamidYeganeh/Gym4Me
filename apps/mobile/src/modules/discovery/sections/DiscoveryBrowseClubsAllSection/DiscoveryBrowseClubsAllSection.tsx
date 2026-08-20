"use client";

import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoveryClubRailCard } from "../../components/DiscoveryClubRailCard";
import { discoveryBrowseClubsAllSectionVariants } from "./DiscoveryBrowseClubsAllSection.styles";
import type { DiscoveryBrowseClubsAllSectionProps } from "./DiscoveryBrowseClubsAllSection.types";

export function DiscoveryBrowseClubsAllSection({
  clubs,
}: DiscoveryBrowseClubsAllSectionProps) {
  const t = useTranslations("DiscoveryClubs");
  const router = useRouter();
  const slots = discoveryBrowseClubsAllSectionVariants();

  if (clubs.length === 0) return null;

  return (
    <section className={slots.root()}>
      <div className={slots.header()}>
        <Typography className={slots.title()} type="h4" weight="bold">
          {t("allClubsTitle")}
        </Typography>
      </div>
      <div className={slots.stack()}>
        {clubs.map((club, index) => {
          const orientation =
            index % 5 === 0
              ? "fullWidth"
              : index % 2 === 0
                ? "horizontal"
                : "vertical";

          return (
            <DiscoveryClubRailCard
              actionLabel={t("viewClub")}
              className={
                orientation === "vertical"
                  ? slots.cardVertical()
                  : slots.cardDefault()
              }
              club={club}
              favoriteLabel={t("favoriteLabel")}
              key={`all-${club.id}`}
              orientation={orientation}
              pricePrefix={t("pricePrefix")}
              priceSuffix={t("priceSuffix")}
              shareLabel={t("shareLabel")}
              onOpen={() => router.push(`/discovery/clubs/${club.id}`)}
            />
          );
        })}
      </div>
    </section>
  );
}
