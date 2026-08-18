"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "@repo/icons";
import { spring } from "@repo/theme";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { welcomeIntroduceFooterSectionVariants } from "./WelcomeIntroduceFooterSection.styles";
import type { WelcomeIntroduceFooterSectionProps } from "./WelcomeIntroduceFooterSection.types";

export function WelcomeIntroduceFooterSection({
  className,
  slideCount,
  slide,
  isRtl,
  title,
  subtitle,
  leftLabel,
  rightLabel,
  onLeftPress,
  onRightPress,
}: WelcomeIntroduceFooterSectionProps) {
  const styles = welcomeIntroduceFooterSectionVariants();
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.root({ className })}>
      <div className={styles.band()}>
        <div aria-hidden className={styles.fade()}>
          <ProgressiveBlur
            blurIntensity={2}
            blurLayers={8}
            className={styles.blur()}
            direction="bottom"
          />
          <div className={styles.wash()} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.copy()}
            exit={{ opacity: 0, y: 8 }}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            key={slide}
            transition={reduceMotion ? { duration: 0 } : spring.snap}
          >
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
        </AnimatePresence>
      </div>

      <div className={styles.sheet()}>
        <div className={styles.row()} dir="ltr">
          <Button
            aria-label={leftLabel}
            className={styles.navButton()}
            isIconOnly
            onPress={onLeftPress}
            size="lg"
            variant="secondary"
          >
            <ChevronLeft rtlMirror={false} size={24} />
          </Button>

          <div
            aria-hidden
            className={styles.dots()}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {Array.from({ length: slideCount }, (_, index) =>
              index === slide ? (
                <motion.span
                  className={styles.dotActive()}
                  key={index}
                  layoutId="welcome-introduce-dot"
                  transition={reduceMotion ? { duration: 0 } : spring.snap}
                />
              ) : (
                <span className={styles.dot()} key={index} />
              ),
            )}
          </div>

          <Button
            aria-label={rightLabel}
            className={styles.navButton()}
            isIconOnly
            onPress={onRightPress}
            size="lg"
            variant="secondary"
          >
            <ChevronRight rtlMirror={false} size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
