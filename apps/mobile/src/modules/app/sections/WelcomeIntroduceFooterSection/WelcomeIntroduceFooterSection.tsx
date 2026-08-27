"use client";

import { Button } from "@heroui/react/button";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { spring } from "@repo/theme";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import {
  estimateTextEffectDelay,
  TextEffect,
} from "@repo/ui/kit/TextEffect";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
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
  const subtitleDelay = useMemo(
    () => estimateTextEffectDelay(title, { per: "word" }),
    [title],
  );

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

        <div className={styles.copy()} key={slide}>
          <TextEffect
            as="h1"
            className={styles.title()}
            key={`title-${slide}`}
            per="word"
            preset="fade-in-blur"
          >
            {title}
          </TextEffect>
          <TextEffect
            as="p"
            className={styles.subtitle()}
            delay={subtitleDelay}
            key={`subtitle-${slide}`}
            per="word"
            preset="fade-in-blur"
          >
            {subtitle}
          </TextEffect>
        </div>
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
