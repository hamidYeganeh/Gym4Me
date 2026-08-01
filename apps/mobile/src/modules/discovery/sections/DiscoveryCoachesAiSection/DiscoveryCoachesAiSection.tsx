"use client";

import { CoachAiCard } from "@repo/ui/cards/CoachAiCard";
import { discoveryCoachesAiSectionStyles as styles } from "./DiscoveryCoachesAiSection.styles";
import type { DiscoveryCoachesAiSectionProps } from "./DiscoveryCoachesAiSection.types";

export function DiscoveryCoachesAiSection({
  title,
  actionLabel,
  onAction,
}: DiscoveryCoachesAiSectionProps) {
  return (
    <section className={styles.root}>
      <CoachAiCard
        actionLabel={actionLabel}
        onAction={onAction}
        title={title}
      />
    </section>
  );
}
