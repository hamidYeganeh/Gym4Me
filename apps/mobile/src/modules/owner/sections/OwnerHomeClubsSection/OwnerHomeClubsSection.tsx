"use client";

import { Typography } from "@heroui/react/typography";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { ownerHomeClubsSectionStyles as styles } from "./OwnerHomeClubsSection.styles";
import type { OwnerHomeClubsSectionProps } from "./OwnerHomeClubsSection.types";

export function OwnerHomeClubsSection({
  title,
  clubs,
  actionLabel,
  pricePrefix,
  priceSuffix,
  shareLabel,
  favoriteLabel,
  onClubAction,
}: OwnerHomeClubsSectionProps) {
  return (
    <section className={styles.root}>
      <Typography className={styles.title} type="h4" weight="semibold">
        {title}
      </Typography>
      <div className={styles.list}>
        {clubs.map((club) => (
          <ClubCard
            key={club.id}
            actionLabel={actionLabel}
            favoriteLabel={favoriteLabel}
            image={club.image}
            imageAlt={club.title}
            onAction={() => onClubAction?.(club.id)}
            orientation="horizontal"
            price={club.price}
            pricePrefix={pricePrefix}
            priceSuffix={priceSuffix}
            rating={club.rating}
            ratingCount={club.ratingCount}
            shareLabel={shareLabel}
            subtitle={club.subtitle}
            title={club.title}
          />
        ))}
      </div>
    </section>
  );
}
