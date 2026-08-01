"use client";

import { Typography } from "@heroui/react";
import { Lock1 } from "@repo/icons/Lock1";
import { athleteMetricsPrivacySectionStyles as styles } from "./AthleteMetricsPrivacySection.styles";
import type { AthleteMetricsPrivacySectionProps } from "./AthleteMetricsPrivacySection.types";

export function AthleteMetricsPrivacySection({
  message,
}: AthleteMetricsPrivacySectionProps) {
  return (
    <section className={styles.root}>
      <Lock1 aria-hidden className={styles.icon} size={20} />
      <Typography className={styles.message} type="body-sm">
        {message}
      </Typography>
    </section>
  );
}
