"use client";

import { Link, Typography } from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Bone } from "@repo/icons/Bone";
import { Fire1 } from "@repo/icons/Fire1";
import { LightningBolt1 } from "@repo/icons/LightningBolt1";
import { PersonYoga } from "@repo/icons/PersonYoga";
import { CoachNearbyCard } from "@repo/ui/cards/CoachNearbyCard";
import type { ReactNode } from "react";
import type { CoachSpecialtyId } from "../../lib/coaches-browse-data";
import { discoveryCoachesNearbySectionStyles as styles } from "./DiscoveryCoachesNearbySection.styles";
import type { DiscoveryCoachesNearbySectionProps } from "./DiscoveryCoachesNearbySection.types";

const SPECIALTY_ICONS: Record<CoachSpecialtyId, ReactNode> = {
  hiit: <Fire1 className={styles.specialtyIcon} size={14} />,
  strength: <BarbellHorizontal className={styles.specialtyIcon} size={14} />,
  yoga: <PersonYoga className={styles.specialtyIcon} size={14} />,
  speed: <LightningBolt1 className={styles.specialtyIcon} size={14} />,
  mobility: <Bone className={styles.specialtyIcon} size={14} />,
};

export function DiscoveryCoachesNearbySection({
  title,
  seeAllLabel,
  remoteLabel,
  inPersonLabel,
  coaches,
  onSeeAll,
  onCoachPress,
}: DiscoveryCoachesNearbySectionProps) {
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

      <div className={styles.list}>
        {coaches.map((coach) => (
          <CoachNearbyCard
            key={coach.id}
            availability={coach.availability}
            distanceLabel={coach.distanceLabel}
            image={coach.image}
            imageAlt={coach.name}
            inPersonLabel={inPersonLabel}
            onPress={() => onCoachPress?.(coach.id)}
            priceLabel={coach.priceLabel}
            rating={coach.rating}
            ratingCount={coach.ratingCount}
            remoteLabel={remoteLabel}
            specialtyIcon={SPECIALTY_ICONS[coach.specialtyId]}
            specialtyLabel={coach.specialtyLabel}
            title={coach.name}
          />
        ))}
      </div>
    </section>
  );
}
