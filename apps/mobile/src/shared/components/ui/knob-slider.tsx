"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
} from "react";
import { duration, spring } from "@repo/theme";
import {
  motion,
  type MotionValue,
  useSpring,
  useTransform,
  motionValue,
} from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/shared/lib/utils";

/* ───────── Sliding Number ───────── */

const DIGIT_SPRING = {
  ...spring.digit,
  mass: 0.3,
};

function Digit({ value, place }: { value: number; place: number }) {
  const digit = Math.floor(value / place) % 10;
  const mv = useMemo(() => motionValue(digit), [digit]);
  const spring = useSpring(mv, DIGIT_SPRING);

  useEffect(() => {
    spring.set(digit);
  }, [digit, spring]);

  return (
    <div
      className="relative inline-block overflow-hidden tabular-nums"
      style={{ width: "0.6em" }}
    >
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <SlotDigit key={i} mv={spring} number={i} />
      ))}
    </div>
  );
}

function SlotDigit({
  mv,
  number,
}: {
  mv: MotionValue<number>;
  number: number;
}) {
  const id = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const offset = (10 + number - (latest % 10)) % 10;
    let pos = offset * bounds.height;
    if (offset > 5) pos -= 10 * bounds.height;
    return pos;
  });

  if (!bounds.height)
    return (
      <span ref={ref} className="invisible absolute">
        {number}
      </span>
    );

  return (
    <motion.span
      ref={ref}
      style={{ y }}
      layoutId={`${id}-${number}`}
      transition={DIGIT_SPRING}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}

function SlidingNumber({ value, blur }: { value: number; blur: number }) {
  const str = Math.abs(value).toString();
  const int = parseInt(str, 10);
  const places = str.split("").map((_, i) => Math.pow(10, str.length - i - 1));

  return (
    <motion.div
      animate={{ filter: `blur(${blur}px)` }}
      transition={{ duration: duration.fast }}
      className="flex items-center justify-center font-bold tracking-tight text-foreground tabular-nums"
      style={{
        fontFamily: "ui-rounded, SF Pro Rounded, system-ui, sans-serif",
        color: "var(--foreground)",
      }}
    >
      {places.map((place, i) => (
        <Digit key={`${place}-${i}`} value={int} place={place} />
      ))}
    </motion.div>
  );
}

/* ───────── Knob ───────── */

export interface KnobSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

export function KnobSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  size = 320,
  className = "",
  "aria-label": ariaLabel = "Value",
}: KnobSliderProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const tickCount = 72;
  const innerSize = size * 0.68;

  const [prev, setPrev] = useState(value);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    if (prev === value) return;
    setBlur(Math.min(10, Math.abs(value - prev)));
    setPrev(value);
  }, [value, prev]);

  useEffect(() => {
    if (blur === 0) return;
    const id = window.setTimeout(() => setBlur(0), 180);
    return () => window.clearTimeout(id);
  }, [blur, value]);

  const updateFromPointer = useCallback(
    (x: number, y: number) => {
      if (!knobRef.current) return;

      const rect = knobRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      const tickAngle = 360 / tickCount;
      const snappedAngle = Math.round(angle / tickAngle) * tickAngle;

      const percent = snappedAngle / 360;
      const newValue = Math.round(percent * (max - min) + min);

      onChange(newValue);
    },
    [min, max, onChange],
  );

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) =>
      updateFromPointer(e.clientX, e.clientY);
    const up = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, updateFromPointer]);

  const range = max - min;
  const progress = range === 0 ? 0 : (value - min) / range;
  const currentAngle = progress * 360;
  const activeTickIndex = Math.round(progress * tickCount) % tickCount;

  return (
    <div
      ref={knobRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setDragging(true);
        updateFromPointer(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(max, value + 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(min, value - 1));
        } else if (e.key === "Home") {
          e.preventDefault();
          onChange(min);
        } else if (e.key === "End") {
          e.preventDefault();
          onChange(max);
        }
      }}
      className={cn(
        "relative flex cursor-[var(--pointer-cursor)] items-center justify-center rounded-full",
        "select-none touch-none outline-none transition-colors duration-moderate ease-app",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--default)",
        color: "var(--default-foreground)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i * 360) / tickCount;
          const isActive =
            activeTickIndex === 0
              ? i === 0
              : i > 0 && i <= activeTickIndex;
          return (
            <line
              key={i}
              x1="50"
              y1="4"
              x2="50"
              y2="9"
              transform={`rotate(${angle} 50 50)`}
              stroke={
                isActive
                  ? "var(--accent)"
                  : "color-mix(in oklab, var(--muted) 70%, transparent)"
              }
              strokeWidth={isActive ? "1" : "0.7"}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div
        className="pointer-events-none absolute inset-0 transition-transform duration-instant ease-app"
        style={{ transform: `rotate(${currentAngle}deg)` }}
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 border-r-transparent border-l-transparent"
          style={{
            top: size * 0.12,
            borderLeftWidth: size * 0.025,
            borderRightWidth: size * 0.025,
            borderBottomWidth: size * 0.045,
            borderStyle: "solid",
            borderBottomColor: "var(--accent)",
          }}
        />
      </div>

      <div
        className="relative flex items-center justify-center rounded-full transition-colors duration-moderate ease-app"
        style={{
          width: innerSize,
          height: innerSize,
          backgroundColor: "var(--surface)",
          color: "var(--surface-foreground)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid var(--border)",
            boxShadow:
              "inset 0 2px 4px color-mix(in oklab, var(--foreground) 6%, transparent)",
          }}
        />

        <div style={{ fontSize: innerSize * 0.28 }}>
          <SlidingNumber value={value} blur={blur} />
        </div>
      </div>
    </div>
  );
}
