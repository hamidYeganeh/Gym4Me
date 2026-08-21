"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { spring } from "@repo/theme";
import { LogoMark } from "@repo/ui/common/LogoMark";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  activeSaveIndex,
  visibleSaveWindow,
} from "@/modules/app/lib/onboarding-save";
import { onboardingSavingSectionVariants } from "./OnboardingSavingSection.styles";
import type { OnboardingSavingSectionProps } from "./OnboardingSavingSection.types";

const SAVING_BG_SRC = "/onboarding-review.png";

export function OnboardingSavingSection({
  ariaLabel,
  steps,
  retryLabel,
  errorLabel,
  onRetry,
  className,
}: OnboardingSavingSectionProps) {
  const reduceMotion = useReducedMotion();
  const activeIndex = activeSaveIndex(steps);
  const visible = visibleSaveWindow(steps, activeIndex);
  const hasError = steps.some((step) => step.status === "error");
  const isBusy = steps.some(
    (step) => step.status === "active" || step.status === "pending",
  );
  const base = onboardingSavingSectionVariants();

  return (
    <section
      aria-busy={isBusy}
      aria-label={ariaLabel}
      aria-live="polite"
      className={base.root({ className })}
    >
      <div aria-hidden className={base.media()}>
        <Image
          alt=""
          className={base.image()}
          fill
          priority
          sizes="100vw"
          src={SAVING_BG_SRC}
        />
        <div className={base.mediaScrim()} />
      </div>

      <div aria-hidden className={base.glow()} />

      <div className={base.stage()}>
        <div className={base.panel()}>
          <ul className={base.list()}>
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((step) => {
                const styles = onboardingSavingSectionVariants({
                  status: step.status,
                });
                return (
                  <motion.li
                    key={step.id}
                    aria-current={
                      step.status === "active" ? "step" : undefined
                    }
                    layout={!reduceMotion}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.row()}
                    exit={
                      reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
                    }
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    transition={spring.gentle}
                  >
                    <span aria-hidden className={styles.statusSlot()}>
                      {step.status === "done" ? (
                        <Check className={styles.checkIcon()} size={16} />
                      ) : null}
                      {step.status === "active" ? (
                        <Spinner color="accent" size="sm" />
                      ) : null}
                    </span>
                    <Typography className={styles.label()} type="body">
                      {step.label}
                    </Typography>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      <div className={base.footer()}>
        {hasError ? (
          <>
            <Typography className={base.error()} color="muted" type="body-sm">
              {errorLabel}
            </Typography>
            <Button
              className={base.retry()}
              variant="secondary"
              onPress={onRetry}
            >
              {retryLabel}
            </Button>
          </>
        ) : null}
        <div className={base.brand()}>
          <div aria-hidden className={base.brandGlow()} />
          <LogoMark
            className={base.mark()}
            instanceId="onboarding-save"
            size={72}
          />
        </div>
      </div>
    </section>
  );
}
