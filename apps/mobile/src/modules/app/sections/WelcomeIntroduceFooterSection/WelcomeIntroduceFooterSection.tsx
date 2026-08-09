"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "@repo/icons";
import { spring } from "@repo/theme";
import { motion, useReducedMotion } from "motion/react";
import { welcomeIntroduceFooterSectionVariants } from "./WelcomeIntroduceFooterSection.styles";
import type { WelcomeIntroduceFooterSectionProps } from "./WelcomeIntroduceFooterSection.types";

export function WelcomeIntroduceFooterSection({
  className,
  slideCount,
  slide,
  isRtl,
  leftLabel,
  rightLabel,
  onLeftPress,
  onRightPress,
}: WelcomeIntroduceFooterSectionProps) {
  const styles = welcomeIntroduceFooterSectionVariants();
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.root({ className })}>
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
  );
}
