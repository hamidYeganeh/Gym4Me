"use client";

import { useState } from "react";

import { duration, ease } from "@repo/theme";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useDiscoveryClubsReserve } from "../../lib/use-discovery-clubs-reserve";
import { DiscoveryClubsReserveActionsSection } from "../../sections/DiscoveryClubsReserveActionsSection";
import { DiscoveryClubsReserveHeroSection } from "../../sections/DiscoveryClubsReserveHeroSection";
import { DiscoveryClubsReservePlanStepSection } from "../../sections/DiscoveryClubsReservePlanStepSection";
import { DiscoveryClubsReserveReviewStepSection } from "../../sections/DiscoveryClubsReserveReviewStepSection";
import { DiscoveryClubsReserveTimeStepSection } from "../../sections/DiscoveryClubsReserveTimeStepSection";
import { discoveryClubsReserveScreenStyles as styles } from "./DiscoveryClubsReserveScreen.styles";
import type { DiscoveryClubsReserveScreenProps } from "./DiscoveryClubsReserveScreen.types";

const stepSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
  }),
};

export function DiscoveryClubsReserveScreen({
  clubTitle,
  clubLocation,
  clubImage,
  days,
  slotsByDay,
  plans,
  onConfirm,
  onJoinWaitlist,
}: DiscoveryClubsReserveScreenProps) {
  const t = useTranslations("ReserveFlow");
  const reduceMotion = useReducedMotion();
  const reserve = useDiscoveryClubsReserve({
    days,
    slotsByDay,
    plans,
    onConfirm,
  });
  const [waitlistPendingId, setWaitlistPendingId] = useState<string | null>(null);
  const [waitlistResult, setWaitlistResult] = useState<{ slotId: string; error: boolean } | null>(null);

  const joinWaitlist = async (slot: Parameters<NonNullable<typeof onJoinWaitlist>>[0]) => {
    if (!onJoinWaitlist || waitlistPendingId) return;
    setWaitlistPendingId(slot.id);
    setWaitlistResult(null);
    try {
      await onJoinWaitlist(slot);
      setWaitlistResult({ slotId: slot.id, error: false });
    } catch {
      setWaitlistResult({ slotId: slot.id, error: true });
    } finally {
      setWaitlistPendingId(null);
    }
  };

  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { duration: duration.moderate, ease: ease.outFluid };

  const slideVariants = reduceMotion
    ? ({
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      } satisfies Variants)
    : stepSlideVariants;

  if (!reserve.isReady || !reserve.isAuthenticated) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="min-h-dvh w-full bg-background"
      />
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryClubsReserveHeroSection
          clubImage={clubImage}
          clubLocation={clubLocation}
          clubTitle={clubTitle}
          onBack={reserve.goBack}
        >
          <FormStepper
            activeIndex={reserve.step}
            aria-label={t("stepperLabel")}
            steps={reserve.steps}
          />

          <AnimatePresence custom={reserve.stepDirection.current} mode="wait">
            <motion.div
              animate="center"
              className={styles.stepPanel}
              custom={reserve.stepDirection.current}
              exit="exit"
              initial="enter"
              key={reserve.step}
              transition={slideTransition}
              variants={slideVariants}
            >
              {reserve.step === 0 ? (
                <DiscoveryClubsReserveTimeStepSection
                  activeDay={reserve.activeDay}
                  activeDayId={reserve.activeDayId}
                  days={reserve.days}
                  onDayPress={reserve.onDayPress}
                  onSlotPress={reserve.setSelectedSlotId}
                  onWaitlistPress={onJoinWaitlist ? (slot) => void joinWaitlist(slot) : undefined}
                  selectedSlotId={reserve.selectedSlotId}
                  slots={reserve.slots}
                  waitlistPendingId={waitlistPendingId}
                  waitlistResult={waitlistResult}
                />
              ) : null}

              {reserve.step === 1 ? (
                <DiscoveryClubsReservePlanStepSection
                  getPlanPrice={reserve.getPlanPrice}
                  onPlanPress={reserve.setSelectedPlanId}
                  plans={reserve.plans}
                  selectedPlanId={reserve.selectedPlanId}
                  selectedSlot={reserve.selectedSlot}
                />
              ) : null}

              {reserve.step === 2 ? (
                <DiscoveryClubsReserveReviewStepSection
                  activeDay={reserve.activeDay}
                  clubTitle={clubTitle}
                  getPlanPrice={reserve.getPlanPrice}
                  selectedPlan={reserve.selectedPlan}
                  selectedSlot={reserve.selectedSlot}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </DiscoveryClubsReserveHeroSection>
      </div>

      <DiscoveryClubsReserveActionsSection
        canGoNext={reserve.canGoNext}
        ctaLabel={reserve.ctaLabel}
        displayPrice={reserve.displayPrice}
        hasSelectedPlan={Boolean(reserve.selectedPlan)}
        hasSelectedSlot={Boolean(reserve.selectedSlot)}
        isSubmitting={reserve.isSubmitting}
        onNext={reserve.goNext}
        priceSuffix={reserve.priceSuffix}
        selectedPlan={reserve.selectedPlan}
        step={reserve.step}
        submitError={reserve.submitError}
      />
    </div>
  );
}
