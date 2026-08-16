"use client";

import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { discoveryHomeCloseCtaSectionVariants } from "./DiscoveryHomeCloseCtaSection.styles";
import type { DiscoveryHomeCloseCtaSectionProps } from "./DiscoveryHomeCloseCtaSection.types";

export function DiscoveryHomeCloseCtaSection({
  title,
  subtitle,
  actionLabel,
  onAction,
}: DiscoveryHomeCloseCtaSectionProps) {
  const slots = discoveryHomeCloseCtaSectionVariants();

  return (
    <section className={slots.root()}>
      <div aria-hidden className={slots.stroke()} />
      <CallToActionCard
        actionLabel={actionLabel}
        actionType="button"
        className={slots.card()}
        onAction={onAction}
        subtitle={subtitle}
        title={title}
        variant="primary"
      />
    </section>
  );
}
