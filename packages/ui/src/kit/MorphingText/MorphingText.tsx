"use client";

import { spring } from "@repo/theme";
import { AnimatePresence, motion } from "motion/react";
import { morphingTextDisplay, morphingTextParts } from "./morphing-text";
import { morphingTextVariants } from "./MorphingText.styles";
import type { MorphingTextProps } from "./MorphingText.types";

export function MorphingText({ value, className }: MorphingTextProps) {
  const slots = morphingTextVariants();

  return (
    <div className={slots.root({ className })}>
      <AnimatePresence mode="popLayout" initial={false}>
        {morphingTextParts(value).map((part, index) => (
          <motion.span
            key={`${part}-${index}`}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: spring.gentle,
            }}
            exit={{ opacity: 0, y: 0, scale: 1, transition: { duration: 0 } }}
          >
            {morphingTextDisplay(part)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
