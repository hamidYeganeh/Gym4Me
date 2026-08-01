"use client";

import { Link, Typography } from "@heroui/react";
import { CoachExpertCard } from "@repo/ui/cards/CoachExpertCard";
import { discoveryCoachesExpertSectionStyles as styles } from "./DiscoveryCoachesExpertSection.styles";
import type { DiscoveryCoachesExpertSectionProps } from "./DiscoveryCoachesExpertSection.types";

export function DiscoveryCoachesExpertSection({
  title,
  seeAllLabel,
  verifiedLabel,
  coaches,
  onSeeAll,
  onCoachPress,
}: DiscoveryCoachesExpertSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <Typography className={styles.title} type="h4" weight="bold">
          {title}
        </Typography>
        <Link className={styles.seeAll} onPress={onSeeAll}>
          {seeAllLabel}
        </Link>
      </div>

      <div className={styles.grid}>
        {coaches.map((coach) => (
          <CoachExpertCard
            key={coach.id}
            image={coach.image}
            imageAlt={coach.name}
            isVerified={coach.isVerified ?? true}
            onPress={() => onCoachPress?.(coach.id)}
            title={coach.name}
            verifiedLabel={verifiedLabel}
          />
        ))}
      </div>
    </section>
  );
}
