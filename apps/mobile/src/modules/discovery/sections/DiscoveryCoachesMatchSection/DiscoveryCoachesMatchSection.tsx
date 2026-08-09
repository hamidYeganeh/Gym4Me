"use client";

import { CoachMatchCard } from "@repo/ui/cards/CoachMatchCard";
import { discoveryCoachesMatchSectionStyles as styles } from "./DiscoveryCoachesMatchSection.styles";
import type { DiscoveryCoachesMatchSectionProps } from "./DiscoveryCoachesMatchSection.types";

export function DiscoveryCoachesMatchSection({
  title,
  actionLabel,
  onAction,
}: DiscoveryCoachesMatchSectionProps) {
  return (
    <section className={styles.root}>
      <CoachMatchCard
        actionLabel={actionLabel}
        onAction={onAction}
        title={title}
      />
    </section>
  );
}
