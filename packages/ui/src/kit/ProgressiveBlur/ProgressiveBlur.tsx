"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  GRADIENT_ANGLES,
  progressiveBlurVariants,
} from "./ProgressiveBlur.styles";
import type { ProgressiveBlurProps } from "./ProgressiveBlur.types";

function buildMaskGradient(angle: number, index: number, segmentSize: number) {
  const stops = [
    index * segmentSize,
    (index + 1) * segmentSize,
    (index + 2) * segmentSize,
    (index + 3) * segmentSize,
  ].map((pos, posIndex) => {
    const alpha = posIndex === 1 || posIndex === 2 ? 1 : 0;
    return `rgba(255, 255, 255, ${alpha}) ${pos * 100}%`;
  });

  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

export function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 12,
  blurIntensity = 0.85,
  className,
  ...props
}: ProgressiveBlurProps) {
  const reduceMotion = useReducedMotion();
  const slots = progressiveBlurVariants();

  const layers = Math.max(2, Math.round(blurLayers));
  const intensity = reduceMotion ? 0 : blurIntensity;
  const segmentSize = 1 / (layers + 1);
  const angle = GRADIENT_ANGLES[direction];

  const bandStyles = useMemo(
    () =>
      Array.from({ length: layers }, (_, index) => {
        const gradient = buildMaskGradient(angle, index, segmentSize);
        const blur = `${index * intensity}px`;
        return {
          maskImage: gradient,
          WebkitMaskImage: gradient,
          backdropFilter: `blur(${blur})`,
          WebkitBackdropFilter: `blur(${blur})`,
        } as const;
      }),
    [angle, intensity, layers, segmentSize],
  );

  return (
    <motion.div
      aria-hidden
      className={slots.root({ className })}
      {...props}
    >
      {bandStyles.map((style, index) => (
        <div className={slots.layer()} key={index} style={style} />
      ))}
    </motion.div>
  );
}
