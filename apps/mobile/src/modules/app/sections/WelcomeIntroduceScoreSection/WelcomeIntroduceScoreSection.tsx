"use client";

import { motion, useReducedMotion } from "motion/react";
import { Gym4MeScoreCard } from "@/modules/app/components/Gym4MeScoreCard";
import { welcomeIntroduceStageItemVariants } from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceScoreSectionVariants } from "./WelcomeIntroduceScoreSection.styles";
import type { WelcomeIntroduceScoreSectionProps } from "./WelcomeIntroduceScoreSection.types";

const PHONE_FRAME_SRC = "/welcome/phone-frame.png";

export function WelcomeIntroduceScoreSection({
  className,
  isActive,
  label,
  statusLabel,
  score,
  delta,
  previousLabel,
  thisMonthLabel,
}: WelcomeIntroduceScoreSectionProps) {
  const styles = welcomeIntroduceScoreSectionVariants();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceStageItemVariants}
    >
      <div className={styles.phoneWrap()}>
        <div aria-hidden className={styles.phoneScreen()} />
        <img
          alt=""
          className={styles.phoneFrame()}
          decoding="async"
          src={PHONE_FRAME_SRC}
        />
      </div>

      <div className={styles.cardWrap()}>
        <motion.div
          animate={reduceMotion || !isActive ? undefined : { y: [0, -7, 0] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  delay: 0.85,
                  duration: 4.2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        >
          <Gym4MeScoreCard
            delta={delta}
            label={label}
            previousLabel={previousLabel}
            score={score}
            statusLabel={statusLabel}
            thisMonthLabel={thisMonthLabel}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
