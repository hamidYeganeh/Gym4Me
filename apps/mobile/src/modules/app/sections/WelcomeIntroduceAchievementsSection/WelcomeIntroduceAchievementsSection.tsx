"use client";

import { spring } from "@repo/theme";
import { motion, useReducedMotion } from "motion/react";
import { WelcomeAchievementCard } from "@/modules/app/components/WelcomeAchievementCard";
import { WELCOME_INTRODUCE_ACHIEVEMENT_CARDS } from "@/modules/app/lib/welcome-introduce-data";
import { welcomeIntroduceSlideStackVariants } from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceAchievementsSectionVariants } from "./WelcomeIntroduceAchievementsSection.styles";
import type { WelcomeIntroduceAchievementsSectionProps } from "./WelcomeIntroduceAchievementsSection.types";

export function WelcomeIntroduceAchievementsSection({
  className,
  isActive,
  unlockedLabel,
  titles,
}: WelcomeIntroduceAchievementsSectionProps) {
  const styles = welcomeIntroduceAchievementsSectionVariants();
  const reduceMotion = useReducedMotion();

  const titleById = {
    fitness: titles.fitness,
    hydration: titles.hydration,
    steps: titles.steps,
  } as const;

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      {WELCOME_INTRODUCE_ACHIEVEMENT_CARDS.map((card) => (
        <motion.div
          className={`${styles.card()} ${styles[card.slot]()}`}
          key={card.id}
          variants={{
            inactive: {
              opacity: 0,
              y: 40,
              rotate: card.rotate * 1.8,
              scale: 0.86,
            },
            active: {
              opacity: 1,
              y: 0,
              rotate: card.rotate,
              scale: 1,
              transition: spring.gentle,
            },
          }}
        >
          <motion.div
            animate={
              reduceMotion || !isActive ? undefined : { y: card.float.y }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    delay: card.float.delay,
                    duration: card.float.duration,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
          >
            <WelcomeAchievementCard
              badgeShape={card.badgeShape}
              icon={card.icon}
              status={unlockedLabel}
              title={titleById[card.id]}
              tone={card.tone}
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
