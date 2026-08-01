"use client";

import { Typography } from "@heroui/react";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { discoveryClubsDetailHeroSectionPullToViewStyles as styles } from "./DiscoveryClubsDetailHeroSectionPullToView.styles";
import type { DiscoveryClubsDetailHeroSectionPullToViewProps } from "./DiscoveryClubsDetailHeroSectionPullToView.types";

type GestureAxis = "horizontal" | "vertical" | null;

const SWIPE_THRESHOLD_PX = 48;
const AXIS_LOCK_PX = 10;
const PULL_MAX_PX = 80; // h-20
const PULL_OPEN_THRESHOLD_PX = 56;
const PULL_RESISTANCE = 0.55;

export function DiscoveryClubsDetailHeroSectionPullToView({
  children,
  onPullOpen,
  onSwipeHorizontal,
}: DiscoveryClubsDetailHeroSectionPullToViewProps) {
  const t = useTranslations("ClubDetail");
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const gestureAxis = useRef<GestureAxis>(null);
  const pullYRef = useRef(0);

  const pullProgress = Math.min(pullY / PULL_MAX_PX, 1);
  const pullTransition = isPulling ? "none" : "transform 200ms var(--ease-app)";

  const resetPull = useCallback((animate: boolean) => {
    setIsPulling(!animate);
    pullYRef.current = 0;
    setPullY(0);
  }, []);

  const openFromPull = useCallback(() => {
    onPullOpen();
    resetPull(true);
  }, [onPullOpen, resetPull]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    gestureAxis.current = null;
    setIsPulling(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerStart.current == null) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;

    if (gestureAxis.current == null) {
      if (Math.abs(deltaX) < AXIS_LOCK_PX && Math.abs(deltaY) < AXIS_LOCK_PX) {
        return;
      }
      gestureAxis.current =
        Math.abs(deltaY) >= Math.abs(deltaX) ? "vertical" : "horizontal";
    }

    if (gestureAxis.current === "vertical") {
      const nextPull =
        deltaY > 0 ? Math.min(deltaY * PULL_RESISTANCE, PULL_MAX_PX) : 0;
      pullYRef.current = nextPull;
      setPullY(nextPull);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerStart.current == null) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const axis = gestureAxis.current;
    const currentPull = pullYRef.current;

    pointerStart.current = null;
    gestureAxis.current = null;

    if (axis === "vertical") {
      if (currentPull >= PULL_OPEN_THRESHOLD_PX) {
        openFromPull();
      } else {
        resetPull(true);
      }
      return;
    }

    resetPull(false);

    if (
      axis === "horizontal" &&
      onSwipeHorizontal &&
      Math.abs(deltaX) >= SWIPE_THRESHOLD_PX
    ) {
      const rootDir =
        typeof document !== "undefined"
          ? document.documentElement.getAttribute("dir")
          : "rtl";
      const isRtl = rootDir === "rtl";
      const swipedTowardStart = isRtl ? deltaX > 0 : deltaX < 0;
      onSwipeHorizontal(swipedTowardStart ? 1 : -1);
    }
  };

  const onPointerCancel = () => {
    pointerStart.current = null;
    gestureAxis.current = null;
    resetPull(true);
  };

  return (
    <>
      <div
        aria-hidden={pullY < 8}
        className={styles.banner}
        style={{
          transform: `translateY(${pullY - PULL_MAX_PX}px)`,
          transition: pullTransition,
        }}
      >
        <ChevronDown
          className={[
            styles.icon,
            pullProgress >= 1 ? styles.iconReady : styles.iconIdle,
          ].join(" ")}
          size={20}
          style={{
            transform: `rotate(${pullProgress >= 1 ? 180 : 0}deg)`,
          }}
        />
        <Typography
          className={pullProgress >= 1 ? styles.labelReady : styles.labelIdle}
          type="body-sm"
          weight="medium"
        >
          {pullProgress >= 1 ? t("releaseGallery") : t("pullGallery")}
        </Typography>
      </div>

      <div
        className={styles.surface}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateY(${pullY}px)`,
          transition: pullTransition,
        }}
      >
        {children}
      </div>
    </>
  );
}
