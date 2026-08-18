"use client";

import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { CoachClientEngagement } from "../../lib/coach-clients-data";
import { coachClientDetailHeroSectionVariants } from "./CoachClientDetailHeroSection.styles";
import type { CoachClientDetailHeroSectionProps } from "./CoachClientDetailHeroSection.types";

const ENGAGEMENT_CHIP_COLOR: Record<
  CoachClientEngagement,
  "success" | "warning" | "default"
> = {
  active: "success",
  "at-risk": "warning",
  paused: "default",
};

const ENGAGEMENT_LABEL_KEY: Record<CoachClientEngagement, string> = {
  active: "engagementActive",
  "at-risk": "engagementAtRisk",
  paused: "engagementPaused",
};

export function CoachClientDetailHeroSection({
  client,
}: CoachClientDetailHeroSectionProps) {
  const t = useTranslations("CoachClientDetail");
  const styles = coachClientDetailHeroSectionVariants();

  return (
    <section className={styles.root()}>
      <Image
        alt={client.name}
        className={styles.avatar()}
        height={96}
        src={client.avatar}
        width={96}
      />
      <Typography className={styles.name()} type="h1" weight="bold">
        {client.name}
      </Typography>
      <Typography className={styles.meta()} type="body-sm">
        {t("heroMeta", {
          goal: client.goalLabel,
          level: client.levelLabel,
        })}
      </Typography>
      <div className={styles.chips()}>
        <Chip
          color={ENGAGEMENT_CHIP_COLOR[client.engagement]}
          size="sm"
          variant="soft"
        >
          <Chip.Label>{t(ENGAGEMENT_LABEL_KEY[client.engagement])}</Chip.Label>
        </Chip>
      </div>
    </section>
  );
}
