"use client";

import { Typography } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import {
  welcomeIntroduceFadeUpVariants,
  welcomeIntroduceSlideStackVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceSlideShellVariants } from "./WelcomeIntroduceSlideShell.styles";
import type { WelcomeIntroduceSlideShellProps } from "./WelcomeIntroduceSlideShell.types";

export function WelcomeIntroduceSlideShell({
  className,
  title,
  subtitle,
  isActive,
  children,
}: WelcomeIntroduceSlideShellProps) {
  const styles = welcomeIntroduceSlideShellVariants();
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label={title} className={styles.root({ className })}>
      <motion.div
        animate={reduceMotion || isActive ? "active" : "inactive"}
        className={styles.stack()}
        initial="inactive"
        variants={welcomeIntroduceSlideStackVariants}
      >
        <motion.div className={styles.copy()} variants={welcomeIntroduceFadeUpVariants}>
          <Typography
            align="center"
            className={styles.title()}
            type="h1"
            weight="bold"
          >
            {title}
          </Typography>
          <Typography
            align="center"
            className={styles.subtitle()}
            type="body"
          >
            {subtitle}
          </Typography>
        </motion.div>

        <div className={styles.stage()}>{children}</div>
      </motion.div>
    </section>
  );
}
