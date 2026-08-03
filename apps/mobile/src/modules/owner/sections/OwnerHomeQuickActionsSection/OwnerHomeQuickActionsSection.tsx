"use client";

import { DotThreeHorizontal, FilmStrip, Image1, Sparkle1 } from "@repo/icons";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { ownerHomeQuickActionsSectionStyles as styles } from "./OwnerHomeQuickActionsSection.styles";
import type { OwnerHomeQuickActionsSectionProps } from "./OwnerHomeQuickActionsSection.types";

const ICON_SIZE = 28;

export function OwnerHomeQuickActionsSection({
  sectionLabel,
  aiLabel,
  photoLabel,
  videoLabel,
  moreLabel,
  onAiPress,
  onPhotoPress,
  onVideoPress,
  onMorePress,
}: OwnerHomeQuickActionsSectionProps) {
  return (
    <section aria-label={sectionLabel} className={styles.root}>
      <div className={styles.grid}>
        <QuickActionCard
          icon={<Sparkle1 size={ICON_SIZE} />}
          label={aiLabel}
          onPress={onAiPress}
        />
        <QuickActionCard
          icon={<Image1 size={ICON_SIZE} />}
          label={photoLabel}
          onPress={onPhotoPress}
        />
        <QuickActionCard
          icon={<FilmStrip size={ICON_SIZE} />}
          label={videoLabel}
          onPress={onVideoPress}
        />
        <QuickActionCard
          icon={<DotThreeHorizontal size={ICON_SIZE} />}
          label={moreLabel}
          onPress={onMorePress}
        />
      </div>
    </section>
  );
}
