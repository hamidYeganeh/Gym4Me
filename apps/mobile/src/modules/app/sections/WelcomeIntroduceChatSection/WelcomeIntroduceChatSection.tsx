"use client";

import { Typography } from "@heroui/react";
import { Checks2 } from "@repo/icons";
import { motion } from "motion/react";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceChatSectionVariants } from "./WelcomeIntroduceChatSection.styles";
import type { WelcomeIntroduceChatSectionProps } from "./WelcomeIntroduceChatSection.types";

export function WelcomeIntroduceChatSection({
  className,
  userMessage,
  userTime,
  aiMessage,
  aiTime,
  widgetTitle,
  widgetSubtitle,
  widgetCta,
}: WelcomeIntroduceChatSectionProps) {
  const styles = welcomeIntroduceChatSectionVariants();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      <motion.div className={styles.rowOut()} variants={welcomeIntroduceStageItemVariants}>
        <div className={styles.bubbleOut()}>
          <Typography className={styles.message()} type="body">
            {userMessage}
          </Typography>
          <div className={`${styles.meta()} ${styles.metaOut()}`}>
            <span>{userTime}</span>
            <Checks2 aria-hidden className={styles.check()} size={14} />
          </div>
        </div>
        <div aria-hidden className={styles.avatar()}>
          <span className={styles.avatarInner()}>You</span>
        </div>
      </motion.div>

      <motion.div className={styles.rowIn()} variants={welcomeIntroduceStageItemVariants}>
        <div aria-hidden className={styles.avatar()}>
          <span className={styles.avatarInner()}>AI</span>
        </div>
        <div className={styles.bubbleIn()}>
          <Typography className={styles.message()} type="body">
            {aiMessage}
          </Typography>
          <div className={styles.widget()}>
            <div aria-hidden className={styles.widgetMedia()} />
            <div className={styles.widgetBody()}>
              <Typography className={styles.widgetTitle()} type="body-sm" weight="semibold">
                {widgetTitle}
              </Typography>
              <Typography className={styles.widgetSubtitle()} type="body-sm">
                {widgetSubtitle}
              </Typography>
              <span className={styles.widgetCta()}>{widgetCta}</span>
            </div>
          </div>
          <div className={styles.meta()}>
            <span>{aiTime}</span>
            <Checks2 aria-hidden className={styles.check()} size={14} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
