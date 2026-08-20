"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Gear1 } from "@repo/icons/Gear1";
import { Moon } from "@repo/icons/Moon";
import { Pencil1 } from "@repo/icons/Pencil1";
import { User } from "@repo/icons/User";
import { screen, spring } from "@repo/theme";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { baseProfileHeroSectionVariants } from "./BaseProfileHeroSection.styles";
import type { BaseProfileHeroSectionProps } from "./BaseProfileHeroSection.types";

const ICON = 20;
const AVATAR_ICON = 40;
const COVER_SRC = "/welcome/hero-athletes.png";

/** Scroll distance over which the morph completes — same as ProfileHeader. */
const SCROLL_RANGE = 160;
const AVATAR_EXPANDED = 96;
const AVATAR_COLLAPSED = 40;
const AVATAR_SCALE_COLLAPSED = AVATAR_COLLAPSED / AVATAR_EXPANDED;
/** HeroUI `size="lg"` icon-only control. */
const CONTROL_SIZE = 44;
/** Collapsed sticky header content height — matches `@repo/ui` Header bar. */
const COLLAPSED_STAGE = 72;
/** Expanded cover band (excludes safe-area; that lives on the fixed root). */
const EXPANDED_COVER = 220;
/** How far the avatar overlaps the cover bottom (`-mt-14`). */
const AVATAR_OVERLAP = 56;
/** Edit badge hangs past the avatar; keep it inside the stage/root clip. */
const EDIT_BADGE_OVERHANG = 10;
/** Gap between avatar edge and side actions when expanded. */
const GAP_AVATAR_CONTROL = 24;
const SCREEN_PAD = screen.margin;
const STAGE_WIDTH_FALLBACK = screen.width;

const EXPANDED_STAGE =
  EXPANDED_COVER + (AVATAR_EXPANDED - AVATAR_OVERLAP) + EDIT_BADGE_OVERHANG;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Ease through the middle so the morph feels intentional — same as ProfileHeader. */
function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Scroll → collapse progress, eased with the juicy default spring.
 */
function useScrollProgress(reduceMotion: boolean | null) {
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, (y) => clamp01(y / SCROLL_RANGE));
  const eased = useSpring(raw, spring.default);
  return reduceMotion ? raw : eased;
}

function useMorph(progress: MotionValue<number>) {
  return useTransform(progress, (p) => smoothstep(p));
}

export function BaseProfileHeroSection({
  displayName,
  avatarSrc,
  onSettingsPress,
  onThemePress,
  onEditPress,
  className,
}: BaseProfileHeroSectionProps) {
  const t = useTranslations("Mobile.Profile");
  const reduceMotion = useReducedMotion();
  const styles = baseProfileHeroSectionVariants();

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(STAGE_WIDTH_FALLBACK);
  /** Escape page-shell transforms/`will-change` so `fixed` sticks to the viewport. */
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const progress = useScrollProgress(reduceMotion);
  const morph = useMorph(progress);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const sync = () => {
      const next = el.offsetWidth;
      if (next > 0) setStageWidth(next);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const expandedAvatarTop = EXPANDED_COVER - AVATAR_OVERLAP;
  const expandedAvatarCenter = expandedAvatarTop + AVATAR_EXPANDED / 2;
  const collapsedCenter = COLLAPSED_STAGE / 2;

  /** Scale-only avatar resize — same element, expanded → compact. */
  const avatarScale = useTransform(morph, (p) => {
    const squash =
      p < 0.45 ? 1 - 0.04 * (p / 0.45) : 0.96 + 0.04 * ((p - 0.45) / 0.55);
    return (1 + (AVATAR_SCALE_COLLAPSED - 1) * p) * squash;
  });

  const stageHeight = useTransform(morph, (p) => {
    return EXPANDED_STAGE + (COLLAPSED_STAGE - EXPANDED_STAGE) * p;
  });

  const coverHeight = useTransform(morph, (p) => {
    return EXPANDED_COVER + (COLLAPSED_STAGE - EXPANDED_COVER) * p;
  });

  /**
   * Keep the visual center of the (scaled) avatar on the morph path.
   * Layout box stays `AVATAR_EXPANDED` with `origin-center` scale.
   */
  const avatarTop = useTransform(morph, (p) => {
    const center =
      expandedAvatarCenter + (collapsedCenter - expandedAvatarCenter) * p;
    return center - AVATAR_EXPANDED / 2;
  });

  const controlTop = useTransform(morph, (p) => {
    const center =
      expandedAvatarCenter + (collapsedCenter - expandedAvatarCenter) * p;
    return center - CONTROL_SIZE / 2;
  });

  const themeLeft = useTransform(morph, (p) => {
    const expanded =
      stageWidth / 2 - AVATAR_EXPANDED / 2 - GAP_AVATAR_CONTROL - CONTROL_SIZE;
    const collapsed = SCREEN_PAD;
    return expanded + (collapsed - expanded) * p;
  });

  const settingsLeft = useTransform(morph, (p) => {
    const expanded = stageWidth / 2 + AVATAR_EXPANDED / 2 + GAP_AVATAR_CONTROL;
    const collapsed = stageWidth - SCREEN_PAD - CONTROL_SIZE;
    return expanded + (collapsed - expanded) * p;
  });

  const coverOpacity = useTransform(morph, [0, 0.7, 1], [1, 0.35, 0]);
  const shellOpacity = useTransform(morph, [0, 0.55, 1], [0, 0.55, 1]);
  const editOpacity = useTransform(morph, [0, 0.35, 0.55], [1, 0.35, 0]);
  const editVisibility = useTransform(morph, (p) =>
    p > 0.55 ? "hidden" : "visible",
  );

  const stageHeightPx = useMotionTemplate`${stageHeight}px`;
  const coverHeightPx = useMotionTemplate`${coverHeight}px`;
  const spacerHeight = useMotionTemplate`calc(${stageHeight}px + env(safe-area-inset-top))`;
  const avatarTopPx = useMotionTemplate`${avatarTop}px`;
  const controlTopPx = useMotionTemplate`${controlTop}px`;
  const themeLeftPx = useMotionTemplate`${themeLeft}px`;
  const settingsLeftPx = useMotionTemplate`${settingsLeft}px`;

  const themeButton = (
    <Button
      aria-label={t("theme")}
      isIconOnly
      onPress={onThemePress}
      size="lg"
      variant="tertiary"
    >
      <Moon size={ICON} />
    </Button>
  );

  const settingsButton = (
    <Button
      aria-label={t("settings")}
      isIconOnly
      onPress={onSettingsPress}
      size="lg"
      variant="tertiary"
    >
      <Gear1 size={ICON} />
    </Button>
  );

  const header = (
      <header className={styles.root({ className })}>
        <motion.div
          className={styles.cover()}
          style={{ height: coverHeightPx, opacity: coverOpacity }}
        >
          <div className={styles.coverMedia()}>
            <Image
              alt=""
              className={styles.coverImage()}
              fill
              priority
              sizes="100vw"
              src={COVER_SRC}
            />
            <div className={styles.coverOverlay()} />
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          className={styles.shell()}
          style={{ opacity: shellOpacity }}
        />

        <motion.div
          className={styles.stage()}
          ref={stageRef}
          style={{ height: stageHeightPx }}
        >
          <motion.div
            className={styles.control()}
            style={{ top: controlTopPx, left: themeLeftPx }}
          >
            {themeButton}
          </motion.div>

          <motion.div
            className={styles.control()}
            style={{ top: controlTopPx, left: settingsLeftPx }}
          >
            {settingsButton}
          </motion.div>

          <motion.div
            className={styles.avatar()}
            style={{
              width: AVATAR_EXPANDED,
              height: AVATAR_EXPANDED,
              top: avatarTopPx,
              left: "50%",
              x: "-50%",
              scale: avatarScale,
            }}
          >
            <Avatar className={styles.avatarInner()} color="accent">
              {avatarSrc ? (
                <Avatar.Image
                  alt={displayName}
                  className={styles.avatarImage()}
                  src={avatarSrc}
                />
              ) : null}
              <Avatar.Fallback className={styles.avatarFallback()}>
                <User size={AVATAR_ICON} />
              </Avatar.Fallback>
            </Avatar>
            <motion.div
              style={{
                opacity: editOpacity,
                visibility: editVisibility,
              }}
            >
              <Button
                aria-label={t("uploadAvatar")}
                className={styles.avatarUpload()}
                isIconOnly
                onPress={onEditPress}
                size="lg"
                variant="tertiary"
              >
                <Pencil1 size={14} />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </header>
  );

  return (
    <>
      <motion.div
        aria-hidden
        className={styles.spacer()}
        style={{ height: spacerHeight }}
      />

      {portalTarget ? createPortal(header, portalTarget) : header}
    </>
  );
}
