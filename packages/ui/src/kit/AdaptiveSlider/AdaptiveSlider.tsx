"use client";

import { spring } from "@repo/theme";
import { useMemo, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { adaptiveSliderVariants } from "./AdaptiveSlider.styles";
import type {
  AdaptiveSliderProps,
  AdaptiveSliderTone,
  AnimatedTextProps,
} from "./AdaptiveSlider.types";

function getTone(value: number, min: number, max: number): AdaptiveSliderTone {
  const range = max - min;
  const percentage = range === 0 ? 0 : (value - min) / range;

  if (percentage < 0.5) return "low";
  if (percentage < 0.7) return "mid";
  return "high";
}

export function AdaptiveSlider({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  label,
  unit,
  showValue = true,
  className,
  trackClassName,
  "aria-label": ariaLabel,
  id,
}: AdaptiveSliderProps) {
  const [internalValue, setInternalValue] = useState(
    () => defaultValue ?? value ?? min,
  );

  const current = value ?? internalValue;
  const tone = getTone(current, min, max);
  const slots = adaptiveSliderVariants({
    tone,
    valueSpacing: label != null || unit != null ? "spaced" : "default",
  });

  const range = max - min;
  const percentage = range === 0 ? 0 : ((current - min) / range) * 100;

  const dots = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={slots.dot()} />
      )),
    [slots],
  );

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <motion.div dir="ltr" className={slots.root({ className })}>
      {label != null && <span className={slots.label()}>{label}</span>}

      {showValue && (
        <div className={slots.valueRow()}>
          <AnimatedText value={String(current)} className={slots.value()} />
          {unit != null && (
            <motion.span layout className={slots.unit()}>
              {unit}
            </motion.span>
          )}
        </div>
      )}

      <div className={slots.track({ className: trackClassName })}>
        <div className={slots.dots()}>{dots}</div>

        <motion.div
          className={slots.fill()}
          animate={{
            width: `calc((${percentage} / 100) * (100% - 52px) + 52px)`,
          }}
          transition={spring.soft}
        />

        <input
          id={id}
          aria-label={
            ariaLabel ?? (typeof label === "string" ? label : "Slider")
          }
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={handleSliderChange}
          className={slots.input()}
        />

        <motion.div
          className={slots.thumb()}
          animate={{
            left: `calc((${percentage} / 100) * (100% - 52px))`,
          }}
          transition={spring.soft}
        >
          <div className={slots.thumbInner()} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function AnimatedText({ value, className }: AnimatedTextProps) {
  const slots = adaptiveSliderVariants();

  return (
    <div className={slots.animatedText({ className })}>
      <AnimatePresence mode="popLayout" initial={false}>
        {value.split("").map((char, index) => {
          const displayChar = char === " " ? "\u00A0" : char;

          return (
            <motion.span
              key={char + index}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: spring.gentle,
              }}
              exit={{ opacity: 0, y: 0, scale: 1, transition: { duration: 0 } }}
            >
              {displayChar}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
