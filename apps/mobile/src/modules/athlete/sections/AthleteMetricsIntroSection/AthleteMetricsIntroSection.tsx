"use client";

import { Typography } from "@heroui/react";
import { MetricPromoCard } from "@repo/ui/cards/MetricPromoCard";
import { athleteMetricsIntroSectionStyles as styles } from "./AthleteMetricsIntroSection.styles";
import type { AthleteMetricsIntroSectionProps } from "./AthleteMetricsIntroSection.types";

export function AthleteMetricsIntroSection({
  title,
  subtitle,
  promoTitle,
  promoAction,
  promoImage,
  promoImageAlt = "",
  onPromoAction,
}: AthleteMetricsIntroSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.heading}>
        <Typography className={styles.title} type="h1" weight="bold">
          {title}
        </Typography>
        <Typography className={styles.subtitle} type="body">
          {subtitle}
        </Typography>
      </div>

      <MetricPromoCard
        actionLabel={promoAction}
        image={promoImage}
        imageAlt={promoImageAlt}
        onAction={onPromoAction}
        title={promoTitle}
      />
    </section>
  );
}
