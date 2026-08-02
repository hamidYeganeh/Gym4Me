"use client";

import { Button } from "@heroui/react";
import { Bookmark } from "@repo/icons/Bookmark";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Heart } from "@repo/icons/Heart";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discoveryClubsDetailHeroSectionHeaderStyles as styles } from "./DiscoveryClubsDetailHeroSectionHeader.styles";
import type { DiscoveryClubsDetailHeroSectionHeaderProps } from "./DiscoveryClubsDetailHeroSectionHeader.types";

export function DiscoveryClubsDetailHeroSectionHeader({
  isFavorite: initialFavorite = false,
  isSaved: initialSaved = false,
  onBack,
  onFavoriteChange,
  onSavedChange,
}: DiscoveryClubsDetailHeroSectionHeaderProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));
  const [isSaved, setIsSaved] = useState(Boolean(initialSaved));

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorite((value) => {
      const next = !value;
      onFavoriteChange?.(next);
      return next;
    });
  };

  const handleSave = () => {
    setIsSaved((value) => {
      const next = !value;
      onSavedChange?.(next);
      return next;
    });
  };

  return (
    <div
      className={styles.root}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Button
        aria-label={t("back")}
        isIconOnly
        onPress={handleBack}
        size="lg"
        variant="secondary"
      >
        <ChevronLeft size={20} />
      </Button>

      <div className={styles.actions}>
        <Button
          aria-label={t("save")}
          aria-pressed={isSaved}
          className={isSaved ? "text-accent" : undefined}
          isIconOnly
          onPress={handleSave}
          size="lg"
          variant="secondary"
        >
          <Bookmark size={20} />
        </Button>
        <Button
          aria-label={t("favorite")}
          aria-pressed={isFavorite}
          isIconOnly
          onPress={handleFavorite}
          size="lg"
          variant={isFavorite ? "danger" : "danger-soft"}
        >
          <Heart size={20} />
        </Button>
      </div>
    </div>
  );
}
