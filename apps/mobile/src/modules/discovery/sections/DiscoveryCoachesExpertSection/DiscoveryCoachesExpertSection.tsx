"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { CoachExpertCard } from "@repo/ui/cards/CoachExpertCard";
import { discoveryCoachesExpertSectionStyles as styles } from "./DiscoveryCoachesExpertSection.styles";
import type { DiscoveryCoachesExpertSectionProps } from "./DiscoveryCoachesExpertSection.types";

export function DiscoveryCoachesExpertSection({
  title,
  hint,
  seeAllLabel,
  verifiedLabel,
  coaches,
  onSeeAll,
  onCoachPress,
}: DiscoveryCoachesExpertSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <Typography className={styles.title} type="h4" weight="bold">
            {title}
          </Typography>
          {hint ? (
            <Typography className={styles.hint} type="body-xs">
              {hint}
            </Typography>
          ) : null}
        </div>
        {onSeeAll ? (
          <Link className={styles.seeAll} onPress={onSeeAll}>
            {seeAllLabel}
          </Link>
        ) : null}
      </div>

      <div aria-label={title} className={styles.scroller}>
        {coaches.map((coach) => (
          <CoachExpertCard
            className={styles.card}
            image={coach.image}
            imageAlt={coach.name}
            isVerified={coach.isVerified ?? true}
            key={coach.id}
            title={coach.name}
            verifiedLabel={verifiedLabel}
            onPress={() => onCoachPress?.(coach.id)}
          />
        ))}
      </div>
    </section>
  );
}
