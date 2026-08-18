"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { CoachPopularItem } from "@repo/ui/cards/CoachPopularItem";
import { Fragment } from "react";
import { discoveryCoachesPopularSectionStyles as styles } from "./DiscoveryCoachesPopularSection.styles";
import type { DiscoveryCoachesPopularSectionProps } from "./DiscoveryCoachesPopularSection.types";

export function DiscoveryCoachesPopularSection({
  title,
  hint,
  seeAllLabel,
  yoeLabel,
  coaches,
  onSeeAll,
  onCoachPress,
}: DiscoveryCoachesPopularSectionProps) {
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

      <div className={styles.list}>
        {coaches.map((coach, index) => (
          <Fragment key={coach.id}>
            <CoachPopularItem
              experienceLabel={yoeLabel(coach.yearsExperience)}
              image={coach.image}
              imageAlt={coach.name}
              onPress={() => onCoachPress?.(coach.id)}
              rank={index + 1}
              rating={coach.rating}
              ratingCount={coach.ratingCount}
              title={coach.name}
            />
            {index < coaches.length - 1 ? (
              <div aria-hidden className={styles.divider} />
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
