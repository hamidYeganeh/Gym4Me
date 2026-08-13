"use client";

import { Typography } from "@heroui/react";
import { Leaf, Sparkle1 } from "@repo/icons";
import { motion } from "motion/react";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceNutritionSectionVariants } from "./WelcomeIntroduceNutritionSection.styles";
import type { WelcomeIntroduceNutritionSectionProps } from "./WelcomeIntroduceNutritionSection.types";

export function WelcomeIntroduceNutritionSection({
  className,
  badge,
  title,
  proteinValue,
  proteinLabel,
  fatValue,
  fatLabel,
  carbsValue,
  carbsLabel,
  cta,
  tipTitle,
  tipBody,
}: WelcomeIntroduceNutritionSectionProps) {
  const styles = welcomeIntroduceNutritionSectionVariants();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      <motion.div
        className={styles.heroCard()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <div className={styles.heroCopy()}>
          <span className={styles.badgeRow()}>
            <Sparkle1 aria-hidden size={16} />
            {badge}
          </span>
          <Typography className={styles.title()} type="body" weight="bold">
            {title}
          </Typography>
          <div className={styles.macros()}>
            <div className={styles.macro()}>
              <span className={styles.macroValue()}>{proteinValue}</span>
              <span className={styles.macroLabel()}>{proteinLabel}</span>
            </div>
            <div className={styles.macro()}>
              <span className={styles.macroValue()}>{fatValue}</span>
              <span className={styles.macroLabel()}>{fatLabel}</span>
            </div>
            <div className={styles.macro()}>
              <span className={styles.macroValue()}>{carbsValue}</span>
              <span className={styles.macroLabel()}>{carbsLabel}</span>
            </div>
          </div>
        </div>
        <div aria-hidden className={styles.heroMedia()} />
      </motion.div>

      <svg aria-hidden className={styles.connector()} viewBox="0 0 245 70">
        <path
          className={styles.path()}
          d="M20 8 C 70 8, 90 55, 122 55 S 180 8, 225 8"
        />
      </svg>

      <motion.span
        className={styles.cta()}
        variants={welcomeIntroduceStageItemVariants}
      >
        {cta}
      </motion.span>

      <motion.div
        className={styles.tipCard()}
        variants={welcomeIntroduceStageItemVariants}
      >
        <span className={styles.tipIcon()}>
          <Leaf aria-hidden size={20} />
        </span>
        <div className={styles.tipCopy()}>
          <p className={styles.tipTitle()}>{tipTitle}</p>
          <p className={styles.tipBody()}>{tipBody}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
