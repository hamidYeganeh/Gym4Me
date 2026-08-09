"use client";

import { motion, useReducedMotion } from "motion/react";
import { WelcomeCommunityPostCard } from "@/modules/app/components/WelcomeCommunityPostCard";
import { welcomeIntroduceStageItemVariants } from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceCommunitySectionVariants } from "./WelcomeIntroduceCommunitySection.styles";
import type { WelcomeIntroduceCommunitySectionProps } from "./WelcomeIntroduceCommunitySection.types";

export function WelcomeIntroduceCommunitySection({
  className,
  isActive,
  author,
  postedAt,
  body,
  hashtags,
  views,
  likes,
  comments,
  saveLabel,
  menuLabel,
}: WelcomeIntroduceCommunitySectionProps) {
  const styles = welcomeIntroduceCommunitySectionVariants();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceStageItemVariants}
    >
      <div className={styles.stack()}>
        <div aria-hidden className={styles.layerBack()} />
        <div aria-hidden className={styles.layerMid()} />

        <motion.div
          animate={
            reduceMotion || !isActive ? undefined : { y: [0, -6, 0] }
          }
          className={styles.card()}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  delay: 0.7,
                  duration: 4.6,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        >
          <WelcomeCommunityPostCard
            author={author}
            body={body}
            comments={comments}
            hashtags={hashtags}
            likes={likes}
            menuLabel={menuLabel}
            postedAt={postedAt}
            saveLabel={saveLabel}
            views={views}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
