"use client";

import { spring } from "@repo/theme";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useThemeCssColors } from "../shared/use-theme-css-colors";
import { fractionalPickerVariants } from "./FractionalPicker.styles";
import type {
  FractionalPickerProps,
  RulerItemProps,
} from "./FractionalPicker.types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function valueToX(value: number, min: number, itemWidth: number) {
  return -(value - min) * itemWidth;
}

function xToValue(x: number, min: number, max: number, itemWidth: number) {
  return clamp(min + Math.round(-x / itemWidth), min, max);
}

function RulerItem({
  value,
  min,
  x,
  itemWidth,
  max,
  nearColor,
  farColor,
}: RulerItemProps) {
  const slots = fractionalPickerVariants();

  const distance = useTransform(x, (latest) => {
    const itemPos = (value - min) * itemWidth;
    return Math.abs(itemPos + latest);
  });

  const opacity = useTransform(distance, [0, itemWidth], [1, 0.3]);
  const scale = useTransform(distance, [0, itemWidth * 0.8], [1.1, 0.9]);
  const color = useTransform(
    distance,
    [0, itemWidth],
    [nearColor, farColor],
  );

  return (
    <div className={slots.item()} style={{ width: itemWidth }}>
      <div className={slots.itemInner()}>
        <motion.span
          className={slots.itemValue()}
          style={{ opacity, scale, color }}
        >
          {value}
        </motion.span>

        <div className={slots.ticks()}>
          <div className={slots.tickMajor()} />
          <div className={slots.tickRow()}>
            {value !== max &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`${value}-sub-${i}`} className={slots.tickMinor()} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FractionalPicker({
  min = 0,
  max = 20,
  value,
  defaultValue,
  itemWidth = 80,
  onChange,
  className,
  "aria-label": ariaLabel,
}: FractionalPickerProps) {
  const slots = fractionalPickerVariants();
  const { foreground, muted } = useThemeCssColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const initial = clamp(value ?? defaultValue ?? min, min, max);
  const x = useMotionValue(valueToX(initial, min, itemWidth));
  const [activeValue, setActiveValue] = useState(initial);
  const activeRef = useRef(initial);
  const isDraggingRef = useRef(false);

  const commitValue = (next: number) => {
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActiveValue(next);
    onChange?.(next);
  };

  const snap = () => {
    const closest = valueToX(
      xToValue(x.get(), min, max, itemWidth),
      min,
      itemWidth,
    );
    animate(x, closest, spring.picker);
  };

  useEffect(() => {
    return x.on("change", (latest) => {
      commitValue(xToValue(latest, min, max, itemWidth));
    });
  }, [x, itemWidth, onChange, min, max]);

  useEffect(() => {
    if (value === undefined || isDraggingRef.current) return;
    const next = clamp(value, min, max);
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActiveValue(next);
    animate(x, valueToX(next, min, itemWidth), spring.picker);
  }, [value, min, max, itemWidth, x]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.offsetWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pad = Math.max(0, containerWidth / 2 - itemWidth / 2);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={activeValue}
      tabIndex={0}
      className={slots.root({ className })}
      style={{ height: 120 }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          const next = clamp(activeValue - 1, min, max);
          commitValue(next);
          animate(x, valueToX(next, min, itemWidth), spring.picker);
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = clamp(activeValue + 1, min, max);
          commitValue(next);
          animate(x, valueToX(next, min, itemWidth), spring.picker);
        }
      }}
    >
      <div className={slots.indicator()}>
        <div
          className={slots.indicatorArrow()}
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }}
        />
        <div className={slots.indicatorDot()} />
      </div>

      <motion.div
        drag="x"
        style={{
          x,
          paddingLeft: pad,
          paddingRight: pad,
        }}
        dragConstraints={{
          left: valueToX(max, min, itemWidth),
          right: valueToX(min, min, itemWidth),
        }}
        dragElastic={0.1}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          isDraggingRef.current = false;
          snap();
        }}
        className={slots.track()}
      >
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <RulerItem
            key={`${i + min}-${foreground}-${muted}`}
            value={i + min}
            min={min}
            x={x}
            itemWidth={itemWidth}
            max={max}
            nearColor={foreground}
            farColor={muted}
          />
        ))}
      </motion.div>

      <div className={slots.fadeLeft()} />
      <div className={slots.fadeRight()} />
    </div>
  );
}
