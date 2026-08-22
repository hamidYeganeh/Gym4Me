"use client";

import { spring } from "@repo/theme";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
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

function valueToX(value: number, pixelsPerUnit: number) {
  return -value * pixelsPerUnit;
}

function xToValue(x: number, min: number, max: number, pixelsPerUnit: number) {
  return clamp(Math.round(-x / pixelsPerUnit), min, max);
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

  const x = useMotionValue(valueToX(seed, PIXELS_PER_UNIT));
  const [displayValue, setDisplayValue] = useState(seed);
  const displayRef = useRef(seed);
  const isDraggingRef = useRef(false);

  const commitValue = useCallback(
    (next: number) => {
      if (next === displayRef.current) return;
      displayRef.current = next;
      setDisplayValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const snap = () => {
    const closest = valueToX(
      xToValue(x.get(), min, max, PIXELS_PER_UNIT),
      PIXELS_PER_UNIT,
    );
    animate(x, closest, spring.picker);
  };

  useEffect(() => {
    return x.on("change", (latest) => {
      commitValue(xToValue(latest, min, max, PIXELS_PER_UNIT));
    });
  }, [x, min, max, commitValue]);

  useEffect(() => {
    if (value === undefined || isDraggingRef.current) return;
    const next = clamp(value, min, max);
    if (next === displayRef.current) return;
    displayRef.current = next;
    setDisplayValue(next);
    animate(x, valueToX(next, PIXELS_PER_UNIT), spring.picker);
  }, [value, min, max, x]);

  const visibleRange = useMemo(() => {
    const items: number[] = [];
    const buffer = 8;
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
          const next = clamp(displayValue - 1, min, max);
          commitValue(next);
          animate(x, valueToX(next, PIXELS_PER_UNIT), spring.picker);
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = clamp(displayValue + 1, min, max);
          commitValue(next);
          animate(x, valueToX(next, PIXELS_PER_UNIT), spring.picker);
        }
      }}
    >
      {label != null && <div className={slots.label()}>{label}</div>}

      <div className={slots.dialArea()}>
        <motion.div
          drag="x"
          dragConstraints={{
            left: valueToX(max, PIXELS_PER_UNIT),
            right: valueToX(min, PIXELS_PER_UNIT),
          }}
          dragElastic={0.1}
          onDragStart={() => {
            isDraggingRef.current = true;
          }}
          onDragEnd={(_event: PointerEvent, _info: PanInfo) => {
            isDraggingRef.current = false;
            snap();
          }}
          className={slots.panLayer()}
          style={{ x, left: "50%" }}
        >
          {visibleRange.map((i) => (
            <DialItem
              key={`${i}-${foreground}-${muted}`}
              value={i}
              pixelsPerUnit={PIXELS_PER_UNIT}
              scrollX={x}
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
