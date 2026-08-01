"use client";

import { Typography } from "@heroui/react";
import { discoveryCoachesIntroSectionStyles as styles } from "./DiscoveryCoachesIntroSection.styles";
import type { DiscoveryCoachesIntroSectionProps } from "./DiscoveryCoachesIntroSection.types";

export function DiscoveryCoachesIntroSection({
  title,
  subtitle,
}: DiscoveryCoachesIntroSectionProps) {
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
