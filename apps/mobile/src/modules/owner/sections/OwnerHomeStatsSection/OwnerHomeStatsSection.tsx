"use client";

import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChartBar2 } from "@repo/icons/ChartBar2";
import { UsersThree } from "@repo/icons/UsersThree";
import {
  MinimalCarousel,
  type MinimalCarouselCard,
  type MinimalCarouselIcon,
} from "@repo/ui/kit/MinimalCarousel";
import { ownerHomeStatsSectionStyles as styles } from "./OwnerHomeStatsSection.styles";
import type { OwnerHomeStatsSectionProps } from "./OwnerHomeStatsSection.types";

const STAT_ICONS: Record<string, MinimalCarouselIcon> = {
  members: UsersThree,
  bookings: Calendar1,
  revenue: ChartBar2,
  occupancy: Building2,
};

export function OwnerHomeStatsSection({
  stats,
  labels,
  copyLabel,
  editLabel,
  onCopyClick,
  onCustomizeClick,
}: OwnerHomeStatsSectionProps) {
  const cards: MinimalCarouselCard[] = stats.map((stat) => ({
    id: stat.id,
    title: labels[stat.titleKey],
    value: `${stat.value} ${labels[stat.unitKey]}`,
    color: stat.color,
    icon: STAT_ICONS[stat.id] ?? ChartBar2,
  }));

  return (
    <section className={styles.root}>
      <MinimalCarousel
        cards={cards}
        className={styles.carousel}
        copyLabel={copyLabel}
        editLabel={editLabel}
        onCopyClick={onCopyClick}
        onCustomizeClick={onCustomizeClick}
      />
    </section>
  );
}
