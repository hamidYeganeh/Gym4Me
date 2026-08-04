"use client";

import { Avatar, Badge, Button, Typography } from "@heroui/react";
import { Bell1 } from "@repo/icons/Bell1";
import { spring } from "@repo/theme";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { MediaImage } from "../../common/MediaImage";
import { PLACEHOLDER_IMAGE } from "../../common/placeholder";
import { ProgressiveBlur } from "../../kit/ProgressiveBlur";
import { profileHeaderVariants } from "./ProfileHeader.styles";
import type { ProfileHeaderProps } from "./ProfileHeader.types";

const SCROLL_RANGE = 160;
const AVATAR_EXPANDED = 88;
const AVATAR_COLLAPSED = 40;
const AVATAR_SCALE_COLLAPSED = AVATAR_COLLAPSED / AVATAR_EXPANDED;
/** h1 (~2.75rem) → compact toolbar title (~1.125rem). */
const NAME_SCALE_COLLAPSED = 1.125 / 2.75;
const PAD_Y = 12;
const INLINE_GAP = 12;
const IDENTITY_FALLBACK = 96;
const EXPANDED_STAGE_MIN_WITH_COVER = 420;
const NOTIFY_LABELED_RESERVE = 132;
const NOTIFY_ICON_RESERVE = 56;
const COLLAPSED_TITLE_LINE = 22;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Ease through the middle so the morph feels intentional. */
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

export function ProfileHeader({
  name,
  bio,
  role,
  coverSrc,
  avatarSrc,
  avatarAlt = "",
  hasNotification = false,
  notificationLabel = "Notifications",
  onNotificationPress,
  className,
}: ProfileHeaderProps) {
  const reduceMotion = useReducedMotion();
  const slots = profileHeaderVariants();
  const avatar = resolveSrc(avatarSrc);
  const hasCover =
    typeof coverSrc === "string" && coverSrc.trim().length > 0;
  const cover = hasCover ? resolveSrc(coverSrc) : null;
  const description = bio?.trim() || role?.trim() || "";

  const identityRef = useRef<HTMLDivElement>(null);
  const [identityHeight, setIdentityHeight] = useState(IDENTITY_FALLBACK);

  const progress = useScrollProgress(reduceMotion);
  const morph = useMorph(progress);

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
  }, [name, description]);

  const contentStageHeight =
    PAD_Y + AVATAR_EXPANDED + 72 + identityHeight + PAD_Y;

  const expandedStageHeight = hasCover
    ? Math.max(EXPANDED_STAGE_MIN_WITH_COVER, contentStageHeight)
    : contentStageHeight;

  const collapsedStageHeight = PAD_Y * 2 + Math.max(AVATAR_COLLAPSED, 48);

  const visualAvatarSize = (p: number) =>
    AVATAR_EXPANDED + (AVATAR_COLLAPSED - AVATAR_EXPANDED) * p;

  /** Scale-only avatar resize — same element, expanded → compact. */
  const avatarScale = useTransform(morph, (p) => {
    const squash =
      p < 0.45 ? 1 - 0.04 * (p / 0.45) : 0.96 + 0.04 * ((p - 0.45) / 0.55);
    return (1 + (AVATAR_SCALE_COLLAPSED - 1) * p) * squash;
  });

  const stageHeight = useTransform(morph, (p) => {
    return (
      expandedStageHeight + (collapsedStageHeight - expandedStageHeight) * p
    );
  });

  /** Hero name rests at the bottom of the stage, then eases into the toolbar. */
  const identityTop = expandedStageHeight - PAD_Y - identityHeight;
  const collapsedTitleTop =
    PAD_Y + Math.max(0, (AVATAR_COLLAPSED - COLLAPSED_TITLE_LINE) / 2);
  const identityY = useTransform(
    morph,
    (p) => (collapsedTitleTop - identityTop) * p,
  );
  const identityStartOffset = useTransform(morph, (p) => {
    return (visualAvatarSize(p) + INLINE_GAP) * p;
  });
  const identityMaxWidth = useTransform(morph, (p) => {
    const avatarSpace = (visualAvatarSize(p) + INLINE_GAP) * p;
    const trailing =
      NOTIFY_LABELED_RESERVE +
      (NOTIFY_ICON_RESERVE - NOTIFY_LABELED_RESERVE) * p;
    return `calc(100% - var(--spacing-screen) * 2 - ${avatarSpace}px - ${trailing}px)`;
  });

  const nameScale = useTransform(morph, [0, 1], [1, NAME_SCALE_COLLAPSED]);
  const bioOpacity = useTransform(morph, [0, 0.35, 0.6], [1, 0.35, 0]);
  const bioVisibility = useTransform(morph, (p) =>
    p > 0.6 ? "hidden" : "visible",
  );

  const notifyTop = PAD_Y + Math.max(0, (AVATAR_EXPANDED - 44) / 2);
  const notifyY = useTransform(morph, (p) => {
    const from = Math.max(0, (AVATAR_EXPANDED - 44) / 2);
    const to = Math.max(0, (AVATAR_COLLAPSED - 44) / 2);
    return (to - from) * p;
  });
  const notifyLabelOpacity = useTransform(morph, [0, 0.35, 0.55], [1, 0.4, 0]);
  const notifyLabelMaxWidth = useTransform(morph, [0, 0.55], [140, 0]);
  const notifyLabelGap = useTransform(morph, [0, 0.55], [6, 0]);
  const coverOpacity = useTransform(morph, [0, 0.7, 1], [1, 0.35, 0]);
  const veilOpacity = useTransform(morph, [0, 0.55, 1], [0, 0.55, 1]);
  const coverBlurDisplay = useTransform(morph, (p) =>
    p > 0 ? "none" : "block",
  );

  const stageHeightPx = useMotionTemplate`${stageHeight}px`;
  const spacerHeight = useMotionTemplate`calc(${stageHeight}px + env(safe-area-inset-top))`;
  const identityStartPx = useMotionTemplate`calc(var(--spacing-screen) + ${identityStartOffset}px)`;
  const notifyLabelMaxWidthPx = useMotionTemplate`${notifyLabelMaxWidth}px`;
  const notifyLabelGapPx = useMotionTemplate`${notifyLabelGap}px`;

  const notifyButton = (
    <Button
      aria-label={notificationLabel}
      className={slots.notifyButton()}
      onPress={onNotificationPress}
      size="lg"
      variant="secondary"
    >
      <Bell1 className="shrink-0" size={20} />
      <motion.span
        className={slots.notifyLabel()}
        style={{
          opacity: notifyLabelOpacity,
          maxWidth: notifyLabelMaxWidthPx,
          marginInlineStart: notifyLabelGapPx,
        }}
      >
        {notificationLabel}
      </motion.span>
    </Button>
  );

  return (
    <>
      <motion.div
        aria-hidden
        className={slots.spacer()}
        style={{ height: spacerHeight }}
      />
      <header className={slots.root({ className })}>
        {cover ? (
          <motion.div
            className={slots.cover()}
            style={{ opacity: coverOpacity }}
          >
            <MediaImage
              alt=""
              aria-hidden
              className={slots.coverImage()}
              image={cover}
              priority
              sizes="100vw"
            />
            <div aria-hidden className={slots.coverFade()} />
            <motion.div
              aria-hidden
              className={slots.coverBlur()}
              style={{ display: coverBlurDisplay }}
            >
              <ProgressiveBlur
                blurIntensity={1.35}
                blurLayers={4}
                className="size-full"
                direction="bottom"
              />
            </motion.div>
          </motion.div>
        ) : (
          <div aria-hidden className={slots.backdrop()}>
            <ProgressiveBlur
              blurIntensity={1.2}
              blurLayers={6}
              className={slots.backdropBlur()}
              direction="top"
            />
            <div className={slots.backdropFade()} />
          </div>
        )}

        {hasCover ? (
          <motion.div
            aria-hidden
            className={slots.veil()}
            style={{ opacity: veilOpacity }}
          />
        ) : null}

        <motion.div className={slots.stage()} style={{ height: stageHeightPx }}>
          <motion.div
            className={slots.avatar()}
            style={{
              width: AVATAR_EXPANDED,
              height: AVATAR_EXPANDED,
              top: PAD_Y,
              scale: avatarScale,
            }}
          >
            <Avatar className="size-full" color="accent">
              <Avatar.Image
                alt={avatarAlt || name}
                className={slots.avatarImage()}
                src={avatar}
              />
              <Avatar.Fallback>{initialsFromName(name)}</Avatar.Fallback>
            </Avatar>
          </motion.div>

          <motion.div
            className={slots.notify()}
            style={{ top: notifyTop, y: notifyY }}
          >
            {hasNotification ? (
              <Badge.Anchor>
                {notifyButton}
                <Badge
                  aria-label={notificationLabel}
                  className={slots.notifyBadge()}
                  color="danger"
                  placement="bottom-right"
                  size="sm"
                >
                  <Badge.Label>9+</Badge.Label>
                </Badge>
              </Badge.Anchor>
            ) : (
              notifyButton
            )}
          </motion.div>

          <motion.div
            className={slots.identity()}
            ref={identityRef}
            style={{
              top: identityTop,
              y: identityY,
              insetInlineStart: identityStartPx,
              maxWidth: identityMaxWidth,
            }}
          >
            <motion.div
              className={slots.nameWrap()}
              style={{ scale: nameScale }}
            >
              <Typography className={slots.name()} type="h1" weight="bold">
                {name}
              </Typography>
            </motion.div>

            {description ? (
              <motion.div
                style={{
                  opacity: bioOpacity,
                  visibility: bioVisibility,
                }}
              >
                <Typography className={slots.bio()} type="body">
                  {description}
                </Typography>
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      </header>
    </>
  );
}
