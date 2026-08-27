"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
  type Variant,
  type Variants,
} from "motion/react";
import { createElement, memo, useMemo } from "react";
import { cn } from "../../lib/utils";
import { textEffectVariants } from "./TextEffect.styles";
import type {
  TextEffectElement,
  TextEffectPer,
  TextEffectPreset,
  TextEffectProps,
} from "./TextEffect.types";

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const satisfies Record<TextEffectElement, (typeof motion)[TextEffectElement]>;

const defaultStaggerTimes: Record<TextEffectPer, number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: { opacity: 0 },
};

const presetVariants: Record<
  TextEffectPreset,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(12px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(12px)" },
    },
  },
  "fade-in-blur": {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: 20, filter: "blur(12px)" },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
};

const AnimationComponent = memo(function AnimationComponent({
  segment,
  variants,
  per,
  segmentWrapperClassName,
}: {
  segment: string;
  variants: Variants;
  per: "line" | "word" | "char";
  segmentWrapperClassName?: string;
}) {
  const content =
    per === "line" ? (
      <motion.span variants={variants} className="block">
        {segment}
      </motion.span>
    ) : per === "word" ? (
      <motion.span
        aria-hidden="true"
        variants={variants}
        className="inline-block whitespace-pre"
      >
        {segment}
      </motion.span>
    ) : (
      <motion.span className="inline-block whitespace-pre">
        {segment.split("").map((char, charIndex) => (
          <motion.span
            key={`char-${charIndex}`}
            aria-hidden="true"
            variants={variants}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );

  if (!segmentWrapperClassName) {
    return content;
  }

  const defaultWrapperClassName = per === "line" ? "block" : "inline-block";

  return (
    <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
      {content}
    </span>
  );
});

function splitText(text: string, per: TextEffectPer) {
  if (per === "line") return text.split("\n");
  return text.split(/(\s+)/);
}

function hasTransition(
  variant?: Variant,
): variant is TargetAndTransition & { transition?: Transition } {
  if (!variant) return false;
  return typeof variant === "object" && "transition" in variant;
}

function createVariantsWithTransition(
  baseVariants: Variants,
  transition?: Transition & { exit?: Transition },
): Variants {
  if (!transition) return baseVariants;

  const { exit: _, ...mainTransition } = transition;

  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(hasTransition(baseVariants.visible)
          ? baseVariants.visible.transition
          : {}),
        ...mainTransition,
      },
    },
    exit: {
      ...baseVariants.exit,
      transition: {
        ...(hasTransition(baseVariants.exit)
          ? baseVariants.exit.transition
          : {}),
        ...mainTransition,
        staggerDirection: -1,
      },
    },
  };
}

export function estimateTextEffectDelay(
  text: string,
  {
    per = "word",
    speedReveal = 1,
    baseDelay = 0.15,
  }: {
    per?: TextEffectPer;
    speedReveal?: number;
    baseDelay?: number;
  } = {},
) {
  const segments = splitText(text, per).filter((segment) => segment.trim().length > 0);
  const stagger = defaultStaggerTimes[per] / speedReveal;
  return baseDelay + Math.max(segments.length - 1, 0) * stagger;
}

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  style,
}: TextEffectProps) {
  const reduceMotion = useReducedMotion();
  const slots = textEffectVariants();
  const MotionTag = motionElements[as];

  const segments = useMemo(() => splitText(children, per), [children, per]);

  const computedVariants = useMemo(() => {
    const baseVariants = preset
      ? presetVariants[preset]
      : { container: defaultContainerVariants, item: defaultItemVariants };

    const stagger = defaultStaggerTimes[per] / speedReveal;
    const baseDuration = 0.3 / speedSegment;

    const customStagger = hasTransition(variants?.container?.visible ?? {})
      ? (variants?.container?.visible as TargetAndTransition).transition
          ?.staggerChildren
      : undefined;

    const customDelay = hasTransition(variants?.container?.visible ?? {})
      ? (variants?.container?.visible as TargetAndTransition).transition
          ?.delayChildren
      : undefined;

    return {
      container: createVariantsWithTransition(
        variants?.container || baseVariants.container,
        {
          staggerChildren: customStagger ?? stagger,
          delayChildren: customDelay ?? delay,
          ...containerTransition,
          exit: {
            staggerChildren: customStagger ?? stagger,
            staggerDirection: -1,
          },
        },
      ),
      item: createVariantsWithTransition(
        variants?.item || baseVariants.item,
        {
          duration: baseDuration,
          ...segmentTransition,
        },
      ),
    };
  }, [
    containerTransition,
    delay,
    per,
    preset,
    segmentTransition,
    speedReveal,
    speedSegment,
    variants?.container,
    variants?.item,
  ]);

  if (reduceMotion) {
    return createElement(as, { className, style }, children);
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger ? (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={computedVariants.container}
          className={className}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={style}
        >
          {per !== "line" ? (
            <span className={slots.srOnly()}>{children}</span>
          ) : null}
          {segments.map((segment, index) => (
            <AnimationComponent
              key={`${per}-${index}-${segment}`}
              segment={segment}
              variants={computedVariants.item}
              per={per}
              segmentWrapperClassName={segmentWrapperClassName}
            />
          ))}
        </MotionTag>
      ) : null}
    </AnimatePresence>
  );
}
