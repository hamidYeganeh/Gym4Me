"use client";

import { Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryCoachRailCard } from "../../components/DiscoveryCoachRailCard";
import { discoveryBrowseCoachesAllSectionVariants } from "./DiscoveryBrowseCoachesAllSection.styles";
import type { DiscoveryBrowseCoachesAllSectionProps } from "./DiscoveryBrowseCoachesAllSection.types";

export function DiscoveryBrowseCoachesAllSection({
  coaches,
}: DiscoveryBrowseCoachesAllSectionProps) {
  const t = useTranslations("DiscoveryCoaches");
  const router = useRouter();
  const slots = discoveryBrowseCoachesAllSectionVariants();

  if (coaches.length === 0) return null;

  return (
    <section className={slots.root()}>
      <div className={slots.header()}>
        <Typography className={slots.title()} type="h4" weight="bold">
          {t("allCoachesTitle")}
        </Typography>
      </div>
      <div className={slots.stack()}>
        {coaches.map((coach, index) => {
          const orientation =
            index % 5 === 0
              ? "fullWidth"
              : index % 2 === 0
                ? "horizontal"
                : "vertical";

          return (
            <DiscoveryCoachRailCard
              actionLabel={t("viewCoach")}
              className={
                orientation === "vertical"
                  ? slots.cardVertical()
                  : slots.cardDefault()
              }
              coach={coach}
              favoriteLabel={t("favoriteLabel")}
              key={`all-${coach.id}`}
              orientation={orientation}
              pricePrefix={t("pricePrefix")}
              priceSuffix={t("priceSuffix")}
              shareLabel={t("shareLabel")}
              onOpen={() => router.push(`/discovery/coaches/${coach.id}`)}
            />
          );
        })}
      </div>
    </section>
  );
}
