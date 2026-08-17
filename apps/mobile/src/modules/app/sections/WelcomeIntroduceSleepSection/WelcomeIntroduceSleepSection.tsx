"use client";

import { Typography } from "@heroui/react";
import { Sparkle1 } from "@repo/icons";
import { motion } from "motion/react";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceSleepSectionVariants } from "./WelcomeIntroduceSleepSection.styles";
import type { WelcomeIntroduceSleepSectionProps } from "./WelcomeIntroduceSleepSection.types";

const STREAK_ACTIVE = 17;
const STREAK_TOTAL = 30;

export function WelcomeIntroduceSleepSection({
  className,
  breakdownTitle,
  remLabel,
  lightLabel,
  deepLabel,
  awakeLabel,
  remDuration,
  remPercent,
  lightDuration,
  lightPercent,
  deepDuration,
  deepPercent,
  awakeDuration,
  awakePercent,
  qualityTitle,
  qualityScore,
  qualityStatus,
  streakTitle,
  streakValue,
  insight,
}: WelcomeIntroduceSleepSectionProps) {
  const styles = welcomeIntroduceSleepSectionVariants();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      <motion.div
        className={styles.card()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <div className={styles.breakdownHeader()}>
          <Typography
            className={styles.breakdownTitle()}
            type="body-xs"
            weight="semibold"
          >
            {breakdownTitle}
          </Typography>
          <div className={styles.legend()}>
            <span className={styles.legendItem()}>
              <span className={`${styles.legendDot()} ${styles.remDot()}`} />
              {remLabel}
            </span>
            <span className={styles.legendItem()}>
              <span className={`${styles.legendDot()} ${styles.lightDot()}`} />
              {lightLabel}
            </span>
            <span className={styles.legendItem()}>
              <span className={`${styles.legendDot()} ${styles.deepDot()}`} />
              {deepLabel}
            </span>
            <span className={styles.legendItem()}>
              <span className={`${styles.legendDot()} ${styles.awakeDot()}`} />
              {awakeLabel}
            </span>
          </div>
        </div>

        <div className={styles.bars()}>
          {(
            [
              [remDuration, remPercent, "remFill"],
              [lightDuration, lightPercent, "lightFill"],
              [deepDuration, deepPercent, "deepFill"],
              [awakeDuration, awakePercent, "awakeFill"],
            ] as const
          ).map(([duration, percent, fill]) => (
            <div className={styles.barCol()} key={fill}>
              <div className={styles.barTrack()}>
                <div className={`${styles.barFill()} ${styles[fill]()}`} />
              </div>
              <div className={styles.barMeta()}>
                <span>{duration}</span>
                <span>{percent}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className={styles.split()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <div className={styles.card()}>
          <Typography
            className={styles.breakdownTitle()}
            type="body-xs"
            weight="semibold"
          >
            {qualityTitle}
          </Typography>
          <div className={styles.qualityBody()}>
            <span aria-hidden className={styles.ring()} />
            <span aria-hidden className={styles.ringAccent()} />
            <div className={styles.qualityScoreWrap()}>
              <span className={styles.qualityScore()}>{qualityScore}</span>
              <span className={styles.qualityStatus()}>{qualityStatus}</span>
            </div>
          </div>
        </div>

        <div className={styles.card()}>
          <Typography
            className={styles.breakdownTitle()}
            type="body-xs"
            weight="semibold"
          >
            {streakTitle}
          </Typography>
          <div aria-hidden className={styles.streakGrid()}>
            {Array.from({ length: STREAK_TOTAL }, (_, index) => (
              <span
                className={
                  index < STREAK_ACTIVE
                    ? styles.streakDot()
                    : styles.streakDotMuted()
                }
                key={index}
              />
            ))}
          </div>
          <Typography className={styles.streakValue()} type="body-sm">
            {streakValue}
          </Typography>
        </div>
      </motion.div>

      <motion.div
        className={styles.insightCard()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <span className={styles.insightIcon()}>
          <Sparkle1 aria-hidden size={22} />
        </span>
        <Typography className={styles.insightText()} type="body-sm">
          {insight}
        </Typography>
      </motion.div>
    </motion.div>
  );
}
