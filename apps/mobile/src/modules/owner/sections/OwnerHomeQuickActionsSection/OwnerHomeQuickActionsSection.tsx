"use client";

import { Typography } from "@heroui/react";
import {
  BarbellHorizontal,
  Calendar1,
  DotThreeHorizontal,
  Kettlebell,
} from "@repo/icons";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { ownerHomeQuickActionsSectionStyles as styles } from "./OwnerHomeQuickActionsSection.styles";
import type { OwnerHomeQuickActionsSectionProps } from "./OwnerHomeQuickActionsSection.types";

const ICON_SIZE = 28;

export function OwnerHomeQuickActionsSection({
  sectionLabel,
  classesLabel,
  bookingsLabel,
  equipmentLabel,
  moreLabel,
  onClassesPress,
  onBookingsPress,
  onEquipmentPress,
  onMorePress,
}: OwnerHomeQuickActionsSectionProps) {
  return (
    <section aria-label={sectionLabel} className={styles.root}>
      <Typography className={styles.title} type="h4" weight="semibold">
        {sectionLabel}
      </Typography>
      <div className={styles.grid}>
        <QuickActionCard
          icon={<Kettlebell size={ICON_SIZE} />}
          label={classesLabel}
          layout="row"
          onPress={onClassesPress}
        />
        <QuickActionCard
          icon={<Calendar1 size={ICON_SIZE} />}
          label={bookingsLabel}
          layout="row"
          onPress={onBookingsPress}
        />
        <QuickActionCard
          icon={<BarbellHorizontal size={ICON_SIZE} />}
          label={equipmentLabel}
          layout="row"
          onPress={onEquipmentPress}
        />
        <QuickActionCard
          icon={<DotThreeHorizontal size={ICON_SIZE} />}
          label={moreLabel}
          layout="row"
          onPress={onMorePress}
        />
      </div>
    </section>
  );
}
