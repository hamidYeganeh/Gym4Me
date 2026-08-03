"use client";

import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { ownerHomeCreateClubSectionStyles as styles } from "./OwnerHomeCreateClubSection.styles";
import type { OwnerHomeCreateClubSectionProps } from "./OwnerHomeCreateClubSection.types";

export function OwnerHomeCreateClubSection({
  title,
  subtitle,
  meta,
  badge,
  actionLabel,
  onAction,
}: OwnerHomeCreateClubSectionProps) {
  return (
    <section className={styles.root}>
      <CallToActionCard
        actionLabel={actionLabel}
        actionType="plus"
        badge={badge}
        meta={meta}
        onAction={onAction}
        subtitle={subtitle}
        title={title}
        variant="soft"
      />
    </section>
  );
}
