"use client";

import { duration, ease } from "@repo/theme";
import { FormStepper } from "@repo/ui/kit/FormStepper";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { addDaysIso } from "../../lib/club-calendar-data";
import { useDiscoveryCoachesReserve } from "../../lib/use-discovery-coaches-reserve";
import { DiscoveryCoachesReserveActionsSection } from "../../sections/DiscoveryCoachesReserveActionsSection";
import { DiscoveryCoachesReserveHeaderSection } from "../../sections/DiscoveryCoachesReserveHeaderSection";
import { DiscoveryCoachesReserveInfoStepSection } from "../../sections/DiscoveryCoachesReserveInfoStepSection";
import { DiscoveryCoachesReservePaymentStepSection } from "../../sections/DiscoveryCoachesReservePaymentStepSection";
import { DiscoveryCoachesReserveTimeStepSection } from "../../sections/DiscoveryCoachesReserveTimeStepSection";
import { discoveryCoachesReserveScreenStyles as styles } from "./DiscoveryCoachesReserveScreen.styles";
import type { DiscoveryCoachesReserveScreenProps } from "./DiscoveryCoachesReserveScreen.types";

const stepSlideVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
};

export function DiscoveryCoachesReserveScreen({
  coach,
}: DiscoveryCoachesReserveScreenProps) {
  const t = useTranslations("CoachReserve");
  const reduceMotion = useReducedMotion();
  const reserve = useDiscoveryCoachesReserve(coach);

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
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={reserve.goBack}
          title={coach.name}
        />

        <div className={styles.main}>
          <DiscoveryCoachesReserveHeaderSection coach={coach} />

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
                <DiscoveryCoachesReserveInfoStepSection
                  conditionKeys={reserve.conditionKeys}
                  fullName={reserve.fullName}
                  note={reserve.note}
                  onConditionKeysChange={reserve.setConditionKeys}
                  onFullNameChange={reserve.setFullName}
                  onNoteChange={reserve.setNote}
                  onPhoneChange={reserve.setPhone}
                  onSupplementKeysChange={reserve.setSupplementKeys}
                  phone={reserve.phone}
                  supplementKeys={reserve.supplementKeys}
                />
              ) : null}

              {reserve.step === 1 ? (
                <DiscoveryCoachesReserveTimeStepSection
                  availabilityDays={reserve.availabilityDays}
                  consultationOptions={reserve.consultationOptions}
                  onConsultationPress={reserve.setSelectedConsultationId}
                  onNextWeek={() =>
                    reserve.setAnchor(addDaysIso(reserve.range.from, 7))
                  }
                  onPrevWeek={() =>
                    reserve.setAnchor(addDaysIso(reserve.range.from, -7))
                  }
                  onSlotPress={reserve.setSelectedSlotId}
                  range={reserve.range}
                  selectedConsultation={reserve.selectedConsultation}
                  selectedSlot={reserve.selectedSlot}
                  selectedSlotId={reserve.selectedSlotId}
                  week={reserve.week}
                />
              ) : null}

              {reserve.step === 2 ? (
                <DiscoveryCoachesReservePaymentStepSection
                  appliedCoupon={reserve.appliedCoupon}
                  coupon={reserve.coupon}
                  error={reserve.error}
                  onApplyCoupon={() =>
                    reserve.setAppliedCoupon(reserve.coupon.trim())
                  }
                  onCouponChange={reserve.setCoupon}
                  price={reserve.price}
                  selectedConsultation={reserve.selectedConsultation}
                  selectedSlot={reserve.selectedSlot}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DiscoveryCoachesReserveActionsSection
        canGoNext={reserve.canGoNext}
        ctaLabel={reserve.ctaLabel}
        hasSelectedSlot={Boolean(reserve.selectedSlot)}
        isSubmitting={reserve.isSubmitting}
        onNext={reserve.goNext}
        price={reserve.price}
        step={reserve.step}
      />
    </div>
  );
}
