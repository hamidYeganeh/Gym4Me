"use client";

import { Typography } from "@heroui/react";
import { athleteMetricsReorderIntroSectionStyles as styles } from "./AthleteMetricsReorderIntroSection.styles";
import type { AthleteMetricsReorderIntroSectionProps } from "./AthleteMetricsReorderIntroSection.types";

export function AthleteMetricsReorderIntroSection({
  title,
  subtitle,
}: AthleteMetricsReorderIntroSectionProps) {
  return (
    <section className={styles.root}>
      <Typography className={styles.title} type="h1" weight="bold">
        {title}
      </Typography>
      <Typography className={styles.subtitle} type="body">
        {subtitle}
      </Typography>
    </section>
  );
}
