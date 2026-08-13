"use client";

import { motion, useReducedMotion } from "motion/react";
import { welcomeIntroduceStageItemVariants } from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceMealsSectionVariants } from "./WelcomeIntroduceMealsSection.styles";
import type { WelcomeIntroduceMealsSectionProps } from "./WelcomeIntroduceMealsSection.types";

const TILE_SLOTS = [
  ["t0", "t1", "t2", "t3"],
  ["t4", "t5", "t6"],
  ["t7", "t8", "t9", "t10"],
] as const;

export function WelcomeIntroduceMealsSection({
  className,
  isActive,
}: WelcomeIntroduceMealsSectionProps) {
  const styles = welcomeIntroduceMealsSectionVariants();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceStageItemVariants}
    >
      <motion.div
        animate={
          reduceMotion || !isActive
            ? undefined
            : { y: [0, -6, 0], rotate: [0, 0.4, 0] }
        }
        className={styles.grid()}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                delay: 0.4,
                duration: 5.2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }
        }
      >
        {TILE_SLOTS.map((row, rowIndex) => (
          <div
            className={`${styles.row()} ${
              rowIndex === 1
                ? styles.rowOffset()
                : rowIndex === 2
                  ? styles.rowOffsetAlt()
                  : ""
            }`}
            key={rowIndex}
          >
            {row.map((slot) => (
              <span
                aria-hidden
                className={`${styles.tile()} ${styles[slot]()}`}
                key={slot}
              />
            ))}
          </div>
        ))}
      </motion.div>
      <div aria-hidden className={styles.glow()} />
    </motion.div>
  );
}
