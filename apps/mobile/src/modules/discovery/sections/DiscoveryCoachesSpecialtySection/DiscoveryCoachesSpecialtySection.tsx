"use client";

import { Button, Link, Typography } from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Bone } from "@repo/icons/Bone";
import { Fire1 } from "@repo/icons/Fire1";
import { LightningBolt1 } from "@repo/icons/LightningBolt1";
import { PersonYoga } from "@repo/icons/PersonYoga";
import type { ReactNode } from "react";
import type { CoachSpecialtyId } from "../../lib/coaches-browse-data";
import { discoveryCoachesSpecialtySectionStyles as styles } from "./DiscoveryCoachesSpecialtySection.styles";
import type { DiscoveryCoachesSpecialtySectionProps } from "./DiscoveryCoachesSpecialtySection.types";

const SPECIALTY_ICONS: Record<CoachSpecialtyId, ReactNode> = {
  hiit: <Fire1 className={styles.chipIcon} size={16} />,
  strength: <BarbellHorizontal className={styles.chipIcon} size={16} />,
  yoga: <PersonYoga className={styles.chipIcon} size={16} />,
  speed: <LightningBolt1 className={styles.chipIcon} size={16} />,
  mobility: <Bone className={styles.chipIcon} size={16} />,
};

function specialtyIcon(id: string): ReactNode {
  if (id in SPECIALTY_ICONS) {
    return SPECIALTY_ICONS[id as CoachSpecialtyId];
  }
  return <BarbellHorizontal className={styles.chipIcon} size={16} />;
}

export function DiscoveryCoachesSpecialtySection({
  title,
  seeAllLabel,
  specialties,
  onSeeAll,
  onSpecialtyPress,
}: DiscoveryCoachesSpecialtySectionProps) {
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

      <div className={styles.scroller}>
        {specialties.map((specialty) => (
          <Button
            key={specialty.id}
            className={styles.chip}
            onPress={() => onSpecialtyPress?.(specialty.id)}
            variant="ghost"
          >
            {specialtyIcon(specialty.id)}
            <span>{specialty.label}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}
