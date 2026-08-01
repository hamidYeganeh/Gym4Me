"use client";

import { Chip, Typography } from "@heroui/react";
import { Clock } from "@repo/icons/Clock";
import { Fire1 } from "@repo/icons/Fire1";
import { StarFull } from "@repo/icons/StarFull";
import { Sun } from "@repo/icons/Sun";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { DiscoveryClubsClassDetailHeroSectionHeader } from "../DiscoveryClubsClassDetailHeroSectionHeader";
import { discoveryClubsClassDetailHeroSectionStyles as styles } from "./DiscoveryClubsClassDetailHeroSection.styles";
import type { DiscoveryClubsClassDetailHeroSectionProps } from "./DiscoveryClubsClassDetailHeroSection.types";

export function DiscoveryClubsClassDetailHeroSection({
  classDetail,
}: DiscoveryClubsClassDetailHeroSectionProps) {
  const t = useTranslations("ClubClassDetail");
  const image = classDetail.image || PLACEHOLDER_IMAGE;

  const stats = [
    {
      key: "duration",
      icon: <Clock aria-hidden size={16} />,
      value: classDetail.durationLabel,
    },
    {
      key: "rating",
      icon: <StarFull aria-hidden className="text-stats-orange" size={16} />,
      value: t("ratingValue", { rating: classDetail.rating }),
    },
    {
      key: "calories",
      icon: <Fire1 aria-hidden className="text-stats-orange" size={16} />,
      value: classDetail.caloriesLabel,
    },
  ] as const;

  return (
    <section aria-label={classDetail.title} className={styles.root}>
      <div className={styles.media}>
        <Image
          alt=""
          className={styles.image}
          fill
          priority
          sizes="100vw"
          src={image}
        />
        <div aria-hidden className={styles.scrim} />
        <DiscoveryClubsClassDetailHeroSectionHeader
          isBookmarked={classDetail.isBookmarked}
        />
      </div>

      <div className={styles.sheet}>
        <div className={styles.card}>
          <div className={styles.categoryRow}>
            <Chip className={styles.categoryChip} size="sm">
              <Sun aria-hidden className={styles.categoryIcon} size={14} />
              <Chip.Label>{classDetail.category}</Chip.Label>
            </Chip>
          </div>

          <Typography className={styles.title} type="h2" weight="bold">
            {classDetail.title}
          </Typography>

          <Typography className={styles.tagline} type="body-sm">
            {classDetail.tagline}
          </Typography>

          <div className={styles.stats}>
            {stats.map((stat) => (
              <div className={styles.stat} key={stat.key}>
                <span aria-hidden className={styles.statIconWrap}>
                  {stat.icon}
                </span>
                <Typography className={styles.statValue} type="body-xs">
                  {stat.value}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
