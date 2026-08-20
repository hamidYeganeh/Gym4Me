"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Bookmark } from "@repo/icons/Bookmark";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Share1 } from "@repo/icons/Share1";
import { spring } from "@repo/theme";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useLayoutEffect, useRef, useState } from "react";
import { discoveryCoachesDetailHeroSectionHeaderStyles as styles } from "./DiscoveryCoachesDetailHeroSectionHeader.styles";
import type { DiscoveryCoachesDetailHeroSectionHeaderProps } from "./DiscoveryCoachesDetailHeroSectionHeader.types";

/** Distance after hero-pass over which the morph completes — same as ProfileHeader. */
export const COACH_DETAIL_HEADER_SCROLL_RANGE = 160;

const AVATAR_EXPANDED = 72;
const AVATAR_COLLAPSED = 36;
const AVATAR_SCALE_COLLAPSED = AVATAR_COLLAPSED / AVATAR_EXPANDED;
/** Sheet title (~1.65rem) → compact toolbar title (~0.875rem). */
const NAME_SCALE_COLLAPSED = 0.875 / 1.65;
const PAD_Y = 12;
const SCREEN_PAD = 16;
/** HeroUI `size="lg"` icon-only button. */
const CONTROL_SIZE = 44;
const GAP_CONTROL_AVATAR = 10;
const GAP_AVATAR_NAME = 12;
const IDENTITY_FALLBACK = 40;
const COLLAPSED_TITLE_LINE = 22;
/** Collapsed sticky header — matches `@repo/ui` Header bar. */
const COLLAPSED_STAGE = 72;
/** Expanded name starts inset like the sheet title (`px-5`). */
const EXPANDED_NAME_INSET = 20;
/** Space before avatar: screen pad + back button + gap. */
const AVATAR_START =
  SCREEN_PAD + CONTROL_SIZE + GAP_CONTROL_AVATAR;
/** Trailing reserve for the save button. */
const END_RESERVE = SCREEN_PAD + CONTROL_SIZE;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Ease through the middle so the morph feels intentional — same as ProfileHeader. */
function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

function resolveSrc(src: string | undefined) {
  if (typeof src !== "string") return PLACEHOLDER_IMAGE;
  const trimmed = src.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

/**
 * Scroll progress starts only after the hero has passed (`morphStartY`),
 * then eases with the same spring as ProfileHeader.
 */
function useScrollProgress(
  reduceMotion: boolean | null,
  morphStartY: number,
) {
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, (y) =>
    clamp01((y - morphStartY) / COACH_DETAIL_HEADER_SCROLL_RANGE),
  );
  const eased = useSpring(raw, spring.default);
  return reduceMotion ? raw : eased;
}

function useMorph(progress: MotionValue<number>) {
  return useTransform(progress, (p) => smoothstep(p));
}

export function DiscoveryCoachesDetailHeroSectionHeader({
  name,
  avatarSrc,
  morphStartY = Number.POSITIVE_INFINITY,
  isFavorite: initialFavorite = false,
  onBack,
  onFavoriteChange,
  onShare,
}: DiscoveryCoachesDetailHeroSectionHeaderProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));
  const [isPastHero, setIsPastHero] = useState(false);

  const identityRef = useRef<HTMLDivElement>(null);
  const [identityHeight, setIdentityHeight] = useState(IDENTITY_FALLBACK);

  const { scrollY } = useScroll();
  const progress = useScrollProgress(reduceMotion, morphStartY);
  const morph = useMorph(progress);
  const avatar = resolveSrc(avatarSrc);

  useMotionValueEvent(scrollY, "change", (y) => {
    setIsPastHero(y >= morphStartY);
  });

  useLayoutEffect(() => {
    setIsPastHero(scrollY.get() >= morphStartY);
  }, [morphStartY, scrollY]);

  useLayoutEffect(() => {
    const el = identityRef.current;
    if (!el) return;

    const sync = () => {
      const next = el.offsetHeight;
      if (next > 0) setIdentityHeight(next);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [name]);

  const expandedStageHeight =
    PAD_Y + AVATAR_EXPANDED + 12 + identityHeight + PAD_Y;

  const visualAvatarSize = (p: number) =>
    AVATAR_EXPANDED + (AVATAR_COLLAPSED - AVATAR_EXPANDED) * p;

  /** Scale-only avatar resize — same element, expanded → compact (ProfileHeader). */
  const avatarScale = useTransform(morph, (p) => {
    const squash =
      p < 0.45 ? 1 - 0.04 * (p / 0.45) : 0.96 + 0.04 * ((p - 0.45) / 0.55);
    return (1 + (AVATAR_SCALE_COLLAPSED - 1) * p) * squash;
  });

  /** Keep the detail toolbar aligned with the shared 72px page header. */
  const stageHeight = useTransform(scrollY, () => COLLAPSED_STAGE);

  /** Hero name rests at the bottom of the stage, then eases into the toolbar. */
  const identityTop = expandedStageHeight - PAD_Y - identityHeight;
  const collapsedTitleTop = Math.max(
    0,
    (COLLAPSED_STAGE - COLLAPSED_TITLE_LINE) / 2,
  );
  const collapsedAvatarTop = Math.max(
    0,
    (COLLAPSED_STAGE - AVATAR_COLLAPSED) / 2,
  );
  const identityY = useTransform(
    morph,
    (p) => (collapsedTitleTop - identityTop) * p,
  );
  const avatarTop = useTransform(
    morph,
    (p) => PAD_Y + (collapsedAvatarTop - PAD_Y) * p,
  );
  const identityStartOffset = useTransform(morph, (p) => {
    const collapsed =
      AVATAR_START + visualAvatarSize(p) + GAP_AVATAR_NAME;
    return EXPANDED_NAME_INSET + (collapsed - EXPANDED_NAME_INSET) * p;
  });
  const identityMaxWidth = useTransform(morph, (p) => {
    const leading =
      EXPANDED_NAME_INSET +
      (AVATAR_START + visualAvatarSize(p) + GAP_AVATAR_NAME - EXPANDED_NAME_INSET) *
        p;
    return `calc(100% - ${leading + END_RESERVE + 12}px)`;
  });

  const nameScale = useTransform(morph, [0, 1], [1, NAME_SCALE_COLLAPSED]);

  const stageHeightPx = useMotionTemplate`${stageHeight}px`;
  const identityStartPx = useMotionTemplate`${identityStartOffset}px`;
  const avatarStartPx = `${AVATAR_START}px`;
  const avatarTopPx = useMotionTemplate`${avatarTop}px`;

  const veilOpacity = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    if (scroll < morphStartY) return 0;
    if (morphP < 0.55) return (morphP / 0.55) * 0.55;
    return 0.55 + ((morphP - 0.55) / 0.45) * 0.45;
  });
  const blurOpacity = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    if (scroll < morphStartY) return 0;
    return Math.min(1, morphP * 1.2);
  });

  const identityOpacity = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    if (scroll < morphStartY) return 0;
    if (morphP < 0.08) return morphP / 0.08;
    return Math.max(0, (0.45 - morphP) / 0.37);
  });
  const identityVisibility = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    return scroll >= morphStartY && morphP > 0.01 ? "visible" : "hidden";
  });

  const shareOpacity = useTransform(morph, [0, 0.35, 0.6], [1, 0.4, 0]);
  const shareVisibility = useTransform(morph, (p) =>
    p > 0.6 ? "hidden" : "visible",
  );
  const shareMaxWidth = useTransform(morph, [0, 0.6], [44, 0]);
  const shareMaxWidthPx = useMotionTemplate`${shareMaxWidth}px`;
  const shareMargin = useTransform(morph, [0, 0.6], [8, 0]);
  const shareMarginPx = useMotionTemplate`${shareMargin}px`;
  const compactTitleOpacity = useTransform(morph, [0.12, 0.55], [0, 1]);
  const compactTitleY = useTransform(morph, [0, 1], [38, 0]);
  const compactTitleScale = useTransform(morph, [0, 1], [1.45, 1]);

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

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
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
        style={{ opacity: blurOpacity }}
      >
        <ProgressiveBlur
          blurIntensity={0.85}
          blurLayers={12}
          className="absolute inset-0"
          direction="top"
        />
      </motion.div>

      <motion.div className={styles.stage} style={{ height: stageHeightPx }}>
        <motion.div
          className={styles.avatar}
          style={{
            width: AVATAR_EXPANDED,
            height: AVATAR_EXPANDED,
            top: avatarTopPx,
            insetInlineStart: avatarStartPx,
            scale: avatarScale,
            opacity: identityOpacity,
            visibility: identityVisibility,
          }}
        >
          <Avatar className="size-full rounded-lg" color="accent">
            <Avatar.Image
              alt={name}
              className={styles.avatarImage}
              src={avatar}
            />
            <Avatar.Fallback>{initialsFromName(name)}</Avatar.Fallback>
          </Avatar>
        </motion.div>

        <div className={styles.bar}>
          <div className={styles.barStart}>
            <Button
              aria-label={t("back")}
              className={isPastHero ? undefined : styles.control}
              isIconOnly
              onPress={handleBack}
              size="lg"
              variant="secondary"
            >
              <ChevronLeft size={20} />
            </Button>
          </div>

          <motion.div
            aria-hidden
            className={styles.compactTitle}
            style={{
              opacity: compactTitleOpacity,
              scale: compactTitleScale,
              y: compactTitleY,
            }}
          >
            <Typography className="truncate" type="h3" weight="bold">
              {name}
            </Typography>
          </motion.div>

          <div className={styles.barEnd}>
            <motion.div
              className="overflow-hidden"
              style={{
                opacity: shareOpacity,
                visibility: shareVisibility,
                maxWidth: shareMaxWidthPx,
                marginInlineEnd: shareMarginPx,
              }}
            >
              <Button
                aria-label={t("share")}
                className={isPastHero ? undefined : styles.control}
                isIconOnly
                onPress={handleShare}
                size="lg"
                variant="secondary"
              >
                <Share1 size={20} />
              </Button>
            </motion.div>

            <Button
              aria-label={t("favorite")}
              aria-pressed={isFavorite}
              className={[
                isPastHero ? "" : styles.control,
                isFavorite ? styles.controlActive : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined}
              isIconOnly
              onPress={handleFavorite}
              size="lg"
              variant="secondary"
            >
              <Bookmark size={20} />
            </Button>
          </div>
        </div>

        <motion.div
          className={styles.identity}
          ref={identityRef}
          style={{
            top: identityTop,
            y: identityY,
            insetInlineStart: identityStartPx,
            maxWidth: identityMaxWidth,
            opacity: identityOpacity,
            visibility: identityVisibility,
          }}
        >
          <motion.div className={styles.nameWrap} style={{ scale: nameScale }}>
            <Typography className={styles.name} type="h2" weight="bold">
              {name}
            </Typography>
          </motion.div>
        </motion.div>
      </motion.div>
    </header>
  );
}
