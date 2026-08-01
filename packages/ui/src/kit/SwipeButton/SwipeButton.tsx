"use client";

import { Typography } from "@heroui/react";
import { ChevronDoubleRight } from "@repo/icons";
import { spring } from "@repo/theme";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { swipeButtonVariants } from "./SwipeButton.styles";
import type { SwipeButtonProps } from "./SwipeButton.types";

const THUMB_INSET = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SwipeButton({
  label,
  onComplete,
  color = "warning",
  trackColor,
  labelColor,
  thumbColor,
  iconColor,
  icon,
  threshold = 0.85,
  stayCompleted = true,
  completed: completedProp,
  defaultCompleted = false,
  disabled = false,
  className,
  thumbClassName,
  labelClassName,
  "aria-label": ariaLabel,
}: SwipeButtonProps) {
  const slots = swipeButtonVariants({ color });
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const completedLockRef = useRef(false);
  const [maxTravel, setMaxTravel] = useState(0);
  const [isRtl, setIsRtl] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uncontrolledCompleted, setUncontrolledCompleted] =
    useState(defaultCompleted);

  const isControlled = completedProp !== undefined;
  const completed = isControlled ? completedProp : uncontrolledCompleted;

  const x = useMotionValue(0);
  const labelOpacity = useTransform(x, (latest) => {
    if (maxTravel <= 0) return 1;
    return clamp(1 - (Math.abs(latest) / maxTravel) * 1.35, 0, 1);
  });

  const endX = isRtl ? -maxTravel : maxTravel;

  const setCompleted = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledCompleted(next);
    },
    [isControlled],
  );

  const triggerComplete = useCallback(() => {
    if (completedLockRef.current || disabled) return;
    completedLockRef.current = true;

    void animate(x, endX, spring.snap);
    setCompleted(true);
    onComplete?.();

    if (!stayCompleted) {
      window.setTimeout(() => {
        completedLockRef.current = false;
        setCompleted(false);
        void animate(x, 0, spring.snap);
      }, 350);
    }
  }, [disabled, endX, onComplete, setCompleted, stayCompleted, x]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const thumb = thumbRef.current;
    if (!root || !thumb) return;

    const direction = getComputedStyle(root).direction === "rtl";
    setIsRtl(direction);

    const travel = Math.max(
      0,
      root.clientWidth - thumb.offsetWidth - THUMB_INSET * 2,
    );
    setMaxTravel(travel);

    if (completed) {
      x.set(direction ? -travel : travel);
    }
  }, [completed, x]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    completedLockRef.current = completed;
    if (maxTravel <= 0) return;

    if (completed) {
      void animate(x, endX, spring.snap);
      return;
    }

    completedLockRef.current = false;
    void animate(x, 0, spring.snap);
  }, [completed, endX, maxTravel, x]);

  const maybeCompleteFromPosition = useCallback(
    (info?: PanInfo) => {
      if (disabled || completed || maxTravel <= 0) return;

      const progress = Math.abs(x.get()) / maxTravel;
      const velocity = info?.velocity.x ?? 0;
      const flungTowardEnd = isRtl ? velocity < -600 : velocity > 600;

      if (progress >= threshold || flungTowardEnd) {
        triggerComplete();
        return;
      }

      void animate(x, 0, spring.snap);
    },
    [completed, disabled, isRtl, maxTravel, threshold, triggerComplete, x],
  );

  const handleDrag = () => {
    if (disabled || completed || maxTravel <= 0) return;
    if (Math.abs(x.get()) / maxTravel >= threshold) {
      triggerComplete();
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setDragging(false);
    maybeCompleteFromPosition(info);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || completed) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerComplete();
      return;
    }

    const towardEnd =
      (!isRtl && event.key === "ArrowRight") ||
      (isRtl && event.key === "ArrowLeft");
    const towardStart =
      (!isRtl && event.key === "ArrowLeft") ||
      (isRtl && event.key === "ArrowRight");

    if (towardEnd) {
      event.preventDefault();
      triggerComplete();
    } else if (towardStart) {
      event.preventDefault();
      void animate(x, 0, spring.snap);
    }
  };

  const rootStyle: CSSProperties = {
    ...(trackColor ? { backgroundColor: trackColor } : null),
    ...(labelColor ? { color: labelColor } : null),
  };

  const thumbInlineStyle: CSSProperties = {
    ...(thumbColor ? { backgroundColor: thumbColor } : null),
    ...(iconColor ? { color: iconColor } : null),
  };

  const isInteractive = !disabled && !completed;
  const dragConstraints = isRtl
    ? { left: -maxTravel, right: 0 }
    : { left: 0, right: maxTravel };

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={
        ariaLabel ?? (typeof label === "string" ? label : "Swipe button")
      }
      data-disabled={disabled || undefined}
      data-completed={completed || undefined}
      className={slots.root({ className })}
      style={rootStyle}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className={slots.label({ className: labelClassName })}
        style={{ opacity: labelOpacity }}
      >
        <Typography type="body" weight="semibold" className="text-inherit">
          {label}
        </Typography>
      </motion.div>

      <motion.div
        ref={thumbRef}
        drag={isInteractive ? "x" : false}
        dragConstraints={dragConstraints}
        dragElastic={0.04}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        className={slots.thumb({ className: thumbClassName })}
        style={{ x, ...thumbInlineStyle }}
        data-dragging={dragging || undefined}
        aria-hidden
      >
        {icon ?? (
          <ChevronDoubleRight className={slots.icon()} size={24} aria-hidden />
        )}
      </motion.div>
    </div>
  );
}
