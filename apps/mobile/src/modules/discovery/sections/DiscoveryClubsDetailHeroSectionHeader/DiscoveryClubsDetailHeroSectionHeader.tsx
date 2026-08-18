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
import { discoveryClubsDetailHeroSectionHeaderStyles as styles } from "./DiscoveryClubsDetailHeroSectionHeader.styles";
import type { DiscoveryClubsDetailHeroSectionHeaderProps } from "./DiscoveryClubsDetailHeroSectionHeader.types";

const SCROLL_FADE_RANGE = 96;

export function DiscoveryClubsDetailHeroSectionHeader({
  isFavorite: initialFavorite = false,
  onBack,
  onFavoriteChange,
  onShare,
}: DiscoveryClubsDetailHeroSectionHeaderProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));

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

  const handleFavorite = () => {
    setIsFavorite((value) => {
      const next = !value;
      onFavoriteChange?.(next);
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
            aria-pressed={isFavorite}
            className={[
              styles.control,
              isFavorite ? styles.controlActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            isIconOnly
            onPress={handleFavorite}
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
