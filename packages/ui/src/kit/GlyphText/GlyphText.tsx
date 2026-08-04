"use client";

import { statsColors } from "@repo/theme";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { glyphTextVariants } from "./GlyphText.styles";
import type { GlyphTextProps } from "./GlyphText.types";

/** Theme-synced sweep palette (stats + brand accent). */
const DEFAULT_COLORS = [
  statsColors.purple,
  statsColors.red,
  statsColors.yellow,
  "var(--accent)",
  statsColors.blue,
];

const BAND_HALF = 17;
const SWEEP_START = -BAND_HALF;
const SWEEP_END = 100 + BAND_HALF;

const sweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function buildGradient(
  pos: number,
  colors: string[],
  textColor: string,
  rtl: boolean,
) {
  const bandStart = pos - BAND_HALF;
  const bandEnd = pos + BAND_HALF;
  const angle = rtl ? "270deg" : "90deg";

  if (bandStart >= 100) {
    return `linear-gradient(${angle}, ${textColor}, ${textColor})`;
  }
  const n = colors.length;
  const parts: string[] = [];

  if (bandStart > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`);

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2;
    parts.push(`${c} ${pct.toFixed(2)}%`);
  });

  if (bandEnd < 100)
    parts.push(`transparent ${bandEnd.toFixed(2)}%`, `transparent 100%`);

  return `linear-gradient(${angle}, ${parts.join(", ")})`;
}

function measureWidths(el: HTMLElement, texts: string[]) {
  const computed = getComputedStyle(el);
  const ghost = el.cloneNode() as HTMLElement;
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    maxWidth: "none",
    whiteSpace: "nowrap",
    font: computed.font,
    letterSpacing: computed.letterSpacing,
    textTransform: computed.textTransform,
    direction: computed.direction,
  });
  ghost.dir = el.dir || computed.direction;
  el.parentElement!.appendChild(ghost);
  const widths = texts.map((t) => {
    ghost.textContent = t;
    return ghost.getBoundingClientRect().width;
  });
  ghost.remove();
  return widths;
}

function readIsRtl(el: HTMLElement | null) {
  if (!el || typeof window === "undefined") return false;
  return getComputedStyle(el).direction === "rtl";
}

export function GlyphText({
  text,
  colors = DEFAULT_COLORS,
  textColor = "var(--foreground)",
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 0.5,
  startOnView = true,
  once = true,
  className,
  fixedWidth = false,
  dir,
  ...props
}: GlyphTextProps) {
  const texts = Array.isArray(text) ? text : [text];
  const isMulti = texts.length > 1;
  const prefersReducedMotion = useReducedMotion();
  const slots = glyphTextVariants({ multi: isMulti, fixedWidth });

  const spanRef = useRef<HTMLSpanElement>(null);
  const optsRef = useRef({
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
    rtl: false,
  });
  optsRef.current = {
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
    rtl: optsRef.current.rtl,
  };

  const indexRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const isFirstSweepRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playRef = useRef<() => void>(() => undefined);
  const stopRef = useRef<(() => void) | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);
  const [isRtl, setIsRtl] = useState(false);

  const sweepPos = useMotionValue(SWEEP_START);

  const backgroundImage = useTransform(sweepPos, (pos) =>
    buildGradient(
      pos,
      optsRef.current.colors,
      optsRef.current.textColor,
      optsRef.current.rtl,
    ),
  );

  const isInView = useInView(spanRef, { once, amount: 0.1 });
  const textKey = Array.isArray(text) ? text.join("\0") : text;

  useLayoutEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const sync = () => {
      const rtl = readIsRtl(el);
      optsRef.current.rtl = rtl;
      setIsRtl(rtl);
      // Force gradient recompute for the current sweep position.
      sweepPos.set(sweepPos.get());
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["dir"] });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => observer.disconnect();
  }, [dir, sweepPos]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !isMulti) return;
    setMeasuredWidths(measureWidths(el, optsRef.current.texts));
  }, [textKey, isMulti, isRtl, className]);

  playRef.current = () => {
    const {
      duration: sweepDuration,
      delay: sweepDelay,
      repeat: shouldRepeat,
      repeatDelay: pause,
      texts: cycleTexts,
    } = optsRef.current;

    sweepPos.set(SWEEP_START);

    const controls = animate(sweepPos, SWEEP_END, {
      duration: sweepDuration,
      delay: isFirstSweepRef.current ? sweepDelay : 0,
      ease: sweepEase,
      onComplete() {
        if (!shouldRepeat) return;
        timerRef.current = setTimeout(() => {
          const next = (indexRef.current + 1) % cycleTexts.length;
          indexRef.current = next;
          setActiveIndex(next);
          playRef.current();
        }, pause * 1000);
      },
    });

    isFirstSweepRef.current = false;
    stopRef.current = () => controls.stop();
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(SWEEP_END);
      return;
    }
    if (startOnView && !isInView) return;
    if (once && hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playRef.current();

    return () => {
      stopRef.current?.();
      clearTimeout(timerRef.current);
    };
  }, [isInView, startOnView, once, prefersReducedMotion, sweepPos]);

  const fixedW =
    isMulti && fixedWidth && measuredWidths.length > 0
      ? Math.max(...measuredWidths)
      : undefined;

  const animatedW =
    isMulti && !fixedWidth && measuredWidths[activeIndex] != null
      ? measuredWidths[activeIndex]
      : undefined;

  return (
    <motion.span
      ref={spanRef}
      className={slots.root({ className })}
      style={{
        transform: "translateY(-2px)",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        backgroundSize: "100% 100%",
        backgroundImage,
        ...(fixedW != null && { width: fixedW }),
      }}
      animate={animatedW != null ? { width: animatedW } : undefined}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
      dir={dir}
    >
      {texts[activeIndex]}
    </motion.span>
  );
}
