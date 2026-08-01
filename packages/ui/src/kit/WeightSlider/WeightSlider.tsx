"use client";

import { spring } from "@repo/theme";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useThemeCssColors } from "../shared/use-theme-css-colors";
import { weightSliderVariants } from "./WeightSlider.styles";
import type {
  WeightSliderDialItemProps,
  WeightSliderProps,
} from "./WeightSlider.types";

const PIXELS_PER_UNIT = 80;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function DialItem({
  value,
  pixelsPerUnit,
  scrollX,
  nearColor,
  farColor,
}: WeightSliderDialItemProps) {
  const slots = weightSliderVariants();
  const isHalf = value % 1 !== 0;
  const itemX = value * pixelsPerUnit;
  const distance = useTransform(scrollX, (s) => Math.abs(s + itemX));

  const opacity = useTransform(
    distance,
    [0, pixelsPerUnit * 2, pixelsPerUnit * 3],
    [1, 0.4, 0],
  );

  const color = useTransform(
    distance,
    [0, pixelsPerUnit],
    [nearColor, farColor],
  );

  const scale = useTransform(distance, [0, pixelsPerUnit * 2], [1, 0.85]);

  const yOffset = useTransform(
    distance,
    [
      0,
      pixelsPerUnit * 0.5,
      pixelsPerUnit,
      pixelsPerUnit * 1.5,
      pixelsPerUnit * 2,
      pixelsPerUnit * 2.5,
      pixelsPerUnit * 3,
    ],
    [0, 2, 7, 17, 32, 54, 88],
  );

  const rotate = useTransform(scrollX, (s) => {
    const d = s + itemX;
    return (d / pixelsPerUnit) * 12;
  });

  return (
    <motion.div
      className={slots.dialItem()}
      style={{
        left: itemX,
        x: "-50%",
        opacity,
        scale,
        y: yOffset,
        rotate,
        transformOrigin: "center 140px",
      }}
    >
      <motion.span
        className={`${slots.dialValue()} ${isHalf ? "invisible" : ""}`}
        style={{ color }}
      >
        {Math.floor(value)}
      </motion.span>

      <div className={slots.dialTickWrap()}>
        <div className={slots.dialTick()} />
      </div>
    </motion.div>
  );
}

export function WeightSlider({
  min = 0,
  max = 100,
  value,
  defaultValue,
  initialValue,
  onChange,
  label = "Weight",
  className,
  "aria-label": ariaLabel,
}: WeightSliderProps) {
  const slots = weightSliderVariants();
  const { foreground, muted } = useThemeCssColors();
  const seed = clamp(value ?? defaultValue ?? initialValue ?? 25, min, max);

  const x = useMotionValue(-seed * PIXELS_PER_UNIT);
  const springX = useSpring(x, spring.bounce);

  const [displayValue, setDisplayValue] = useState(seed);
  const displayRef = useRef(seed);
  const dragStartX = useRef(x.get());
  const isDraggingRef = useRef(false);

  useEffect(() => {
    return springX.on("change", (latest) => {
      const roundedVal = Math.round(Math.abs(latest / PIXELS_PER_UNIT));
      const next = clamp(roundedVal, min, max);
      if (next === displayRef.current) return;
      displayRef.current = next;
      setDisplayValue(next);
      onChange?.(next);
    });
  }, [springX, min, max, onChange]);

  useEffect(() => {
    if (value === undefined || isDraggingRef.current) return;
    const next = clamp(value, min, max);
    if (next === displayRef.current) return;
    displayRef.current = next;
    setDisplayValue(next);
    x.set(-next * PIXELS_PER_UNIT);
  }, [value, min, max, x]);

  const handlePanStart = () => {
    isDraggingRef.current = true;
    dragStartX.current = x.get();
  };

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    const maxOffset = PIXELS_PER_UNIT;
    const boundedOffset = Math.max(
      -maxOffset,
      Math.min(maxOffset, info.offset.x * 0.6),
    );
    const newX = dragStartX.current + boundedOffset;
    const minX = -max * PIXELS_PER_UNIT;
    const maxX = -min * PIXELS_PER_UNIT;
    x.set(Math.max(minX, Math.min(maxX, newX)));
  };

  const handlePanEnd = (_: PointerEvent, info: PanInfo) => {
    const baseValue = Math.round(dragStartX.current / -PIXELS_PER_UNIT);
    let direction = 0;

    if (info.offset.x < -20 || info.velocity.x < -100) direction = 1;
    else if (info.offset.x > 20 || info.velocity.x > 100) direction = -1;

    const targetValue = clamp(baseValue + direction, min, max);
    x.set(-targetValue * PIXELS_PER_UNIT);
    isDraggingRef.current = false;
  };

  const visibleRange = useMemo(() => {
    const items: number[] = [];
    const buffer = 5;
    for (
      let i = Math.max(min, displayValue - buffer);
      i <= Math.min(max, displayValue + buffer);
      i += 0.5
    ) {
      items.push(i);
    }
    return items;
  }, [min, max, displayValue]);

  return (
    <div
      dir="ltr"
      role="slider"
      aria-label={
        ariaLabel ?? (typeof label === "string" ? label : "Weight slider")
      }
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={displayValue}
      tabIndex={0}
      className={slots.root({ className })}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          x.set(-clamp(displayValue - 1, min, max) * PIXELS_PER_UNIT);
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          x.set(-clamp(displayValue + 1, min, max) * PIXELS_PER_UNIT);
        }
      }}
    >
      {label != null && <div className={slots.label()}>{label}</div>}

      <div className={slots.dialArea()}>
        <motion.div
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className={slots.panLayer()}
          style={{ x: springX, left: "50%" }}
        >
          {visibleRange.map((i) => (
            <DialItem
              key={`${i}-${foreground}-${muted}`}
              value={i}
              pixelsPerUnit={PIXELS_PER_UNIT}
              scrollX={springX}
              nearColor={foreground}
              farColor={muted}
            />
          ))}
        </motion.div>

        <div className={slots.indicator()}>
          <div className={slots.indicatorDot()} />
          <svg
            className={slots.indicatorArrow()}
            viewBox="0 0 10 36"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M 5 2 L 9 36 L 1 36 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
