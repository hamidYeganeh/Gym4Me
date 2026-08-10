"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type UIEvent,
} from "react";
import { heightSliderVariants } from "./HeightSlider.styles";
import type { HeightSliderProps } from "./HeightSlider.types";

const ITEM_HEIGHT = 56;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HeightSlider({
  min = 120,
  max = 220,
  value,
  defaultValue,
  onChange,
  className,
  "aria-label": ariaLabel,
}: HeightSliderProps) {
  const styles = heightSliderVariants();
  const ref = useRef<HTMLDivElement>(null);
  const ignoreScroll = useRef(false);
  const frame = useRef(0);

  const values = useMemo(() => {
    const list: number[] = [];
    for (let n = min; n <= max; n += 1) list.push(n);
    return list;
  }, [min, max]);

  const seed = clamp(value ?? defaultValue ?? Math.round((min + max) / 2), min, max);
  const activeRef = useRef(seed);
  const activeValue = clamp(value ?? activeRef.current, min, max);

  const commit = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      if (clamped === activeRef.current) return;
      activeRef.current = clamped;
      onChange?.(clamped);
    },
    [min, max, onChange],
  );

  const scrollToValue = useCallback(
    (next: number, behavior: ScrollBehavior = "smooth") => {
      const el = ref.current;
      if (!el) return;
      const index = next - min;
      if (index < 0) return;
      ignoreScroll.current = true;
      el.scrollTo({ top: index * ITEM_HEIGHT, behavior });
      window.setTimeout(() => {
        ignoreScroll.current = false;
      }, behavior === "auto" ? 0 : 180);
    },
    [min],
  );

  useEffect(() => {
    scrollToValue(activeValue, "auto");
  }, [activeValue, scrollToValue, values.length]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (ignoreScroll.current) return;
    const top = event.currentTarget.scrollTop;
    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      const index = Math.round(top / ITEM_HEIGHT);
      const next = values[Math.min(values.length - 1, Math.max(0, index))];
      if (next !== undefined) commit(next);
    });
  };

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={activeValue}
      className={styles.root({ className })}
      dir="ltr"
      role="slider"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          const next = clamp(activeValue - 1, min, max);
          commit(next);
          scrollToValue(next);
        }
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          const next = clamp(activeValue + 1, min, max);
          commit(next);
          scrollToValue(next);
        }
      }}
    >
      <div aria-hidden className={styles.highlight()} />
      <div className={styles.column()} ref={ref} onScroll={handleScroll}>
        <div aria-hidden className={styles.pad()} />
        {values.map((item) => {
          const active = item === activeValue;
          const near = Math.abs(item - activeValue) === 1;
          const itemStyles = heightSliderVariants({ active, near: active || near });
          return (
            <div aria-hidden className={itemStyles.item()} key={item}>
              {item}
            </div>
          );
        })}
        <div aria-hidden className={styles.pad()} />
      </div>
    </div>
  );
}
