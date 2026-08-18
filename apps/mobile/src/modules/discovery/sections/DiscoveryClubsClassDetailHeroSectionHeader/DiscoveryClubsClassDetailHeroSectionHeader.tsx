"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Heart } from "@repo/icons/Heart";
import { Share1 } from "@repo/icons/Share1";
import { spring } from "@repo/theme";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { discoveryClubsClassDetailHeroSectionHeaderStyles as styles } from "./DiscoveryClubsClassDetailHeroSectionHeader.styles";
import type { DiscoveryClubsClassDetailHeroSectionHeaderProps } from "./DiscoveryClubsClassDetailHeroSectionHeader.types";

const SCROLL_FADE_RANGE = 96;

export function DiscoveryClubsClassDetailHeroSectionHeader({
  isBookmarked: initialBookmarked = false,
  onBack,
  onBookmarkChange,
  onShare,
}: DiscoveryClubsClassDetailHeroSectionHeaderProps) {
  const t = useTranslations("ClubClassDetail");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isBookmarked, setIsBookmarked] = useState(Boolean(initialBookmarked));

  const { scrollY } = useScroll();
  const rawVeil = useTransform(scrollY, [0, SCROLL_FADE_RANGE], [0, 1]);
  const smoothVeil = useSpring(rawVeil, spring.default);
  const veilOpacity = reduceMotion ? rawVeil : smoothVeil;

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

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        /* user cancelled share sheet */
      }
    }
  };

  return (
    <header className={styles.root}>
      <motion.div
        aria-hidden
        className={styles.veil}
        style={{ opacity: veilOpacity }}
      />
      <motion.div
        aria-hidden
        className={styles.blur}
        style={{ opacity: veilOpacity }}
      >
        <ProgressiveBlur
          blurIntensity={0.85}
          blurLayers={12}
          className="absolute inset-0"
          direction="top"
        />
      </motion.div>

      <div className={styles.bar}>
        <Button
          aria-label={t("back")}
          className={styles.control}
          isIconOnly
          onPress={handleBack}
          size="lg"
          variant="secondary"
        >
          <ChevronLeft size={20} />
        </Button>

        <div className={styles.actions}>
          <Button
            aria-label={t("share")}
            className={styles.control}
            isIconOnly
            onPress={handleShare}
            size="lg"
            variant="secondary"
          >
            <Share1 size={20} />
          </Button>
          <Button
            aria-label={t("favorite")}
            aria-pressed={isBookmarked}
            className={[
              styles.control,
              isBookmarked ? styles.controlActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            isIconOnly
            onPress={handleBookmark}
            size="lg"
            variant="secondary"
          >
            <Heart size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
