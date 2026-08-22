"use client";

import { spring } from "@repo/theme";
import { AnimatePresence, motion } from "motion/react";
import { morphingTextVariants } from "./MorphingText.styles";
import type { MorphingTextProps } from "./MorphingText.types";

export function MorphingText({ value, className }: MorphingTextProps) {
  const slots = morphingTextVariants();

  return (
    <div className={slots.root({ className })}>
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
