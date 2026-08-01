"use client";

import { Button, Typography } from "@heroui/react";
import { Bookmark } from "@repo/icons/Bookmark";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discoveryClubsClassDetailHeroSectionHeaderStyles as styles } from "./DiscoveryClubsClassDetailHeroSectionHeader.styles";
import type { DiscoveryClubsClassDetailHeroSectionHeaderProps } from "./DiscoveryClubsClassDetailHeroSectionHeader.types";

export function DiscoveryClubsClassDetailHeroSectionHeader({
  isBookmarked: initialBookmarked = false,
  onBack,
  onBookmarkChange,
}: DiscoveryClubsClassDetailHeroSectionHeaderProps) {
  const t = useTranslations("ClubClassDetail");
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(Boolean(initialBookmarked));

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const handleBookmark = () => {
    setIsBookmarked((value) => {
      const next = !value;
      onBookmarkChange?.(next);
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <Button
        aria-label={t("back")}
        className={styles.iconButton}
        isIconOnly
        onPress={handleBack}
        size="lg"
        variant="secondary"
      >
        <ChevronLeft size={20} />
      </Button>

      <Typography className={styles.title} type="body">
        {t("pageTitle")}
      </Typography>

      <Button
        aria-label={t("bookmark")}
        aria-pressed={isBookmarked}
        className={[
          styles.iconButton,
          isBookmarked ? "text-stats-orange" : "",
        ].join(" ")}
        isIconOnly
        onPress={handleBookmark}
        size="lg"
        variant="secondary"
      >
        <Bookmark size={20} />
      </Button>
    </div>
  );
}
