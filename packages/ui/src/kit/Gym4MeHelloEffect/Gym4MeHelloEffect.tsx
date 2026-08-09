"use client";

import type { TargetAndTransition } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { gym4MeHelloEffectVariants } from "./Gym4MeHelloEffect.styles";
import type { Gym4MeHelloEffectProps } from "./Gym4MeHelloEffect.types";

const initialProps: TargetAndTransition = {
  pathLength: 0,
  opacity: 0,
};

const animateProps: TargetAndTransition = {
  pathLength: 1,
  opacity: 1,
};

const drawnProps: TargetAndTransition = {
  pathLength: 1,
  opacity: 1,
};

type Stroke = {
  d: string;
  duration: number;
  delay: number;
  accent?: boolean;
};

/** Single-stroke calligraphy paths for the Gym4Me wordmark (Apple Hello–style). */
const STROKES: Stroke[] = [
  {
    d: "M148 95C140 62 112 42 74 42C32 42 6 74 6 112C6 152 38 178 82 178C118 178 144 154 148 120C138 120 114 120 88 120",
    duration: 0.9,
    delay: 0,
  },
  {
    d: "M176 100C184 72 206 58 230 58C258 58 272 80 266 114C260 150 242 178 220 178C200 178 192 158 196 130C204 100 226 84 252 80C272 76 290 86 300 102C294 134 284 176 274 200C264 224 244 236 220 230",
    duration: 1,
    delay: 0.5,
  },
  {
    d: "M318 178C322 144 324 116 326 96C336 70 358 60 380 60C404 60 418 76 416 104C428 74 452 60 478 60C508 60 522 84 516 122C510 156 502 178 502 178",
    duration: 1.1,
    delay: 1.4,
  },
  {
    d: "M545 40C522 78 500 108 488 116C512 116 538 116 568 116",
    duration: 0.7,
    delay: 2.5,
  },
  {
    d: "M540 40C540 86 540 132 540 178",
    duration: 0.5,
    delay: 3.15,
  },
  {
    d: "M590 178C594 134 598 92 604 56C616 96 630 138 642 178C652 132 664 90 674 56C686 98 698 138 710 178",
    duration: 1.1,
    delay: 3.7,
  },
  {
    d: "M758 110C752 86 732 74 708 76C682 78 670 98 672 120C674 144 694 158 718 154C738 150 752 134 756 114C746 106 728 102 712 106",
    duration: 0.8,
    delay: 4.8,
  },
  {
    d: "M720 28C732 40 746 50 760 54",
    duration: 0.55,
    delay: 5.7,
    accent: true,
  },
];

/**
 * Handwriting animation for the Gym4Me brand wordmark (Apple Hello–style SVG strokes).
 */
export function Gym4MeHelloEffect({
  className,
  speed = 1,
  onAnimationComplete,
  ...props
}: Gym4MeHelloEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const slots = gym4MeHelloEffectVariants();
  const calc = (x: number) => x / Math.max(speed, 0.01);
  const lastIndex = STROKES.length - 1;

  useEffect(() => {
    if (prefersReducedMotion) onAnimationComplete?.();
  }, [prefersReducedMotion, onAnimationComplete]);

  const rootClassName = slots.root({
    className: typeof className === "string" ? className : undefined,
  });

  return (
    <motion.svg
      {...props}
      aria-label="Gym4Me"
      className={rootClassName}
      exit={{ opacity: 0 }}
      fill="none"
      initial={{ opacity: 1 }}
      role="img"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="14.8883"
      transition={{ duration: 0.5 }}
      viewBox="0 0 780 210"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Gym4Me</title>
      {STROKES.map((stroke, index) => (
        <motion.path
          key={stroke.d}
          className={stroke.accent ? slots.accent() : undefined}
          d={stroke.d}
          initial={prefersReducedMotion ? drawnProps : initialProps}
          animate={animateProps}
          style={{ strokeLinecap: "round" }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: calc(stroke.duration),
                  ease: "easeInOut",
                  delay: calc(stroke.delay),
                  opacity: {
                    duration: calc(stroke.duration) * 0.5,
                    delay: calc(stroke.delay),
                  },
                }
          }
          onAnimationComplete={
            index === lastIndex ? onAnimationComplete : undefined
          }
        />
      ))}
    </motion.svg>
  );
}
