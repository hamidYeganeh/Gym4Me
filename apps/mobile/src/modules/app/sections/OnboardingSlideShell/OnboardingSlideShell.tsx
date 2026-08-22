"use client";

import { Typography } from "@heroui/react/typography";
import { motion, useReducedMotion } from "motion/react";
import {
  welcomeIntroduceFadeUpVariants,
  welcomeIntroduceSlideStackVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { onboardingSlideShellVariants } from "./OnboardingSlideShell.styles";
import type { OnboardingSlideShellProps } from "./OnboardingSlideShell.types";

export function OnboardingSlideShell({
  className,
  title,
  subtitle,
  showChrome = true,
  bleed = false,
  innerScroll = false,
  isActive,
  children,
}: OnboardingSlideShellProps) {
  const styles = onboardingSlideShellVariants({ bleed, innerScroll });
  const reduceMotion = useReducedMotion();
  const animateState = reduceMotion || isActive ? "active" : "inactive";

  return (
    <section
      aria-label={title}
      className={styles.root({ className })}
      {...(!bleed ? { "data-onboarding-nested-scroll": true } : {})}
    >
      <motion.div
        animate={animateState}
        className={styles.stack()}
        initial={false}
        variants={welcomeIntroduceSlideStackVariants}
      >
        {showChrome ? (
          <motion.div
            className={styles.copy()}
            variants={welcomeIntroduceFadeUpVariants}
          >
            <Typography
              align="center"
              className={styles.title()}
              type="h1"
              weight="bold"
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                align="center"
                className={styles.subtitle()}
                type="body"
              >
                {subtitle}
              </Typography>
            ) : null}
          </motion.div>
        ) : null}

        <motion.div
          className={styles.stage()}
          variants={welcomeIntroduceFadeUpVariants}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
