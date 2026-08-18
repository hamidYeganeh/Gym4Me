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
  isActive,
  children,
}: OnboardingSlideShellProps) {
  const styles = onboardingSlideShellVariants();
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label={title} className={styles.root({ className })}>
      <motion.div
        animate={reduceMotion || isActive ? "active" : "inactive"}
        className={styles.stack()}
        initial="inactive"
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

        <div className={styles.stage()}>{children}</div>
      </motion.div>
    </section>
  );
}
