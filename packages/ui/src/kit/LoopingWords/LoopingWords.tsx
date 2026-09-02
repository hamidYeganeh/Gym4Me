"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { LineShadowText } from "../LineShadowText/LineShadowText";
import { loopingWordsVariants } from "./LoopingWords.styles";
import type { LoopingWordsProps } from "./LoopingWords.types";

const DEFAULT_SHADOW_COLOR =
  "color-mix(in oklab, var(--accent) 45%, transparent)";

export function LoopingWords({
  words,
  duration = 2500,
  shadowColor = DEFAULT_SHADOW_COLOR,
  className,
  as = "span",
  ...props
}: LoopingWordsProps) {
  const reduceMotion = useReducedMotion();
  const slots = loopingWordsVariants();
  const [index, setIndex] = useState(0);

  const safeWords = words.filter((word) => word.trim().length > 0);
  const wordsSignature = safeWords.join("\u0000");
  const currentWord = safeWords[index] ?? safeWords[0];

  useEffect(() => {
    setIndex(0);
  }, [wordsSignature]);

  useEffect(() => {
    if (reduceMotion || safeWords.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeWords.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [duration, reduceMotion, safeWords.length]);

  if (!currentWord) return null;

  if (reduceMotion || safeWords.length <= 1) {
    return (
      <LineShadowText
        as={as}
        className={className}
        shadowColor={shadowColor}
        {...props}
      >
        {currentWord}
      </LineShadowText>
    );
  }

  return (
    <span aria-live="polite" className={slots.root({ className })}>
      <AnimatePresence initial={false} mode="wait">
        <LineShadowText
          key={currentWord}
          animate={{ opacity: 1, y: 0 }}
          as={as}
          className={slots.word()}
          exit={{ opacity: 0, y: -12 }}
          initial={{ opacity: 0, y: 12 }}
          shadowColor={shadowColor}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          {...props}
        >
          {currentWord}
        </LineShadowText>
      </AnimatePresence>
    </span>
  );
}
