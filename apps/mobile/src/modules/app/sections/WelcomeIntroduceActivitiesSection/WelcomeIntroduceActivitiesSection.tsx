"use client";

import { spring } from "@repo/theme";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { WelcomeActivityCard } from "@/modules/app/components/WelcomeActivityCard";
import { WELCOME_INTRODUCE_ACTIVITY_CARDS } from "@/modules/app/lib/welcome-introduce-data";
import { welcomeIntroduceSlideStackVariants } from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceActivitiesSectionVariants } from "./WelcomeIntroduceActivitiesSection.styles";
import type { WelcomeIntroduceActivitiesSectionProps } from "./WelcomeIntroduceActivitiesSection.types";

const WATCH_SRC = "/welcome/activity-watch.png";

export function WelcomeIntroduceActivitiesSection({
  className,
  isActive,
  labels,
}: WelcomeIntroduceActivitiesSectionProps) {
  const styles = welcomeIntroduceActivitiesSectionVariants();
  const reduceMotion = useReducedMotion();

  const toneLabel = {
    light: labels.toneLight,
    calm: labels.toneCalm,
    intense: labels.toneIntense,
  } as const;

  const titleLabel = {
    cycling: labels.cycling,
    kickboxing: labels.kickboxing,
    swimming: labels.swimming,
  } as const;

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      <motion.div
        className={styles.watchWrap()}
        variants={{
          inactive: { opacity: 0, y: 28, scale: 0.92 },
          active: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: spring.gentle,
          },
        }}
      >
        <Image
          alt=""
          className={styles.watchImage()}
          draggable={false}
          fill
          priority={isActive}
          sizes="280px"
          src={WATCH_SRC}
        />
      </motion.div>

      {WELCOME_INTRODUCE_ACTIVITY_CARDS.map((card) => (
        <motion.div
          className={`${styles.card()} ${styles[card.slot]()}`}
          key={card.id}
          variants={{
            inactive: {
              opacity: 0,
              y: 36,
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
            <WelcomeActivityCard
              icon={card.icon}
              title={titleLabel[card.id]}
              tone={card.tone}
              toneLabel={toneLabel[card.tone]}
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
