"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { duration, ease } from "@repo/theme";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { FormStepper, type FormStepperStep } from "@repo/ui/kit/FormStepper";
import { ReservationDayChip } from "@repo/ui/kit/ReservationDayChip";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { Header } from "@repo/ui/layout/Header";
import NumberFlow from "@number-flow/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import type { ReserveSlotState } from "../../lib/reserve-data";
import { discoveryClubsReserveScreenStyles as styles } from "./DiscoveryClubsReserveScreen.styles";
import type { DiscoveryClubsReserveScreenProps } from "./DiscoveryClubsReserveScreen.types";

const DEMO_INVOICE_ID = "inv-demo";
const SLOT_ICON_SIZE = 20;

type ReserveStep = 0 | 1 | 2;

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

function getCapacityClassName(state: ReserveSlotState): string {
  if (state === "low") return styles.slotCapacityLow;
  if (state === "full") return styles.slotCapacityFull;
  return styles.slotCapacity;
}

export function DiscoveryClubsReserveScreen({
  clubTitle,
  clubLocation,
  clubImage,
  days,
  slotsByDay,
  plans,
}: DiscoveryClubsReserveScreenProps) {
  const t = useTranslations("ReserveFlow");
  const router = useRouter();
  const pathname = usePathname();
  const { runWithAuth, isAuthenticated, isReady } = useRequireAuthAction();
  const reduceMotion = useReducedMotion();
  const stepDirection = useRef(1);
  const [step, setStep] = useState<ReserveStep>(0);
  const [activeDayId, setActiveDayId] = useState(
    () =>
      days.find((day) => day.availability === "available")?.id ??
      days[0]?.id ??
      "",
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || isAuthenticated) return;
    runWithAuth(() => undefined, pathname);
  }, [isAuthenticated, isReady, pathname, runWithAuth]);

  const activeDay = days.find((day) => day.id === activeDayId);
  const slots = slotsByDay[activeDayId] ?? [];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const steps: FormStepperStep[] = useMemo(
    () => [
      { key: "time", label: t("stepTime") },
      { key: "plan", label: t("stepPlan") },
      { key: "review", label: t("stepReview") },
    ],
    [t],
  );

  const canGoNext =
    step === 0 ? Boolean(selectedSlot) : step === 1 ? Boolean(selectedPlan) : true;

  const paymentHref = `/athlete/payment/${DEMO_INVOICE_ID}`;

  const goNext = () => {
    if (step === 2) {
      runWithAuth(() => router.push(paymentHref), paymentHref);
      return;
    }
    stepDirection.current = 1;
    setStep((prev) => (prev < 2 ? ((prev + 1) as ReserveStep) : prev));
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    stepDirection.current = -1;
    setStep((prev) => (prev > 0 ? ((prev - 1) as ReserveStep) : prev));
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

  const displayPrice = selectedPlan?.price ?? 0;
  const priceSuffix = selectedPlan?.priceSuffix ?? t("priceSuffix");
  const ctaLabel = step < 2 ? t("nextStep") : t("cta");

  if (!isReady || !isAuthenticated) {
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
        <Header
          className="absolute inset-x-0 top-0 z-20"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={goBack}
              size="lg"
              variant="secondary"
            >
              <ChevronLeft size={20} />
            </Button>
          }
        />

        <div className={styles.hero}>
          <Image
            alt={clubTitle}
            className={styles.heroImage}
            fill
            priority
            sizes="100vw"
            src={clubImage || PLACEHOLDER_IMAGE}
          />
          <div aria-hidden className={styles.heroScrim} />
        </div>

        <div className={styles.sheet}>
          <div className={styles.titleBlock}>
            <Typography className={styles.eyebrow} type="body-sm">
              {t("eyebrow")}
            </Typography>
            <Typography className={styles.title} type="h1" weight="bold">
              {t("title", { club: clubTitle })}
            </Typography>
            {clubLocation ? (
              <Typography className={styles.location} type="body-sm">
                {clubLocation}
              </Typography>
            ) : (
              <Typography className={styles.location} type="body-sm">
                {t("subtitle")}
              </Typography>
            )}
          </div>

          <FormStepper
            activeIndex={step}
            aria-label={t("stepperLabel")}
            steps={steps}
          />

          <AnimatePresence custom={stepDirection.current} mode="wait">
            <motion.div
              animate="center"
              className={styles.stepPanel}
              custom={stepDirection.current}
              exit="exit"
              initial="enter"
              key={step}
              transition={slideTransition}
              variants={slideVariants}
            >
              {step === 0 ? (
                <>
                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <Typography
                        className={styles.sectionTitle}
                        type="h4"
                        weight="semibold"
                      >
                        {t("daysLabel")}
                      </Typography>
                    </div>
                    <div
                      aria-label={t("daysLabel")}
                      className={styles.days}
                      role="group"
                    >
                      {days.map((day) => (
                        <ReservationDayChip
                          availability={day.availability}
                          dateLabel={day.dateLabel}
                          key={day.id}
                          onPress={() => {
                            setActiveDayId(day.id);
                            setSelectedSlotId(null);
                          }}
                          selected={activeDayId === day.id}
                          statusLabel={t(`dayAvailability.${day.availability}`)}
                        />
                      ))}
                    </div>
                  </section>

                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <Typography
                        className={styles.sectionTitle}
                        type="h4"
                        weight="semibold"
                      >
                        {t("slotsTitle")}
                      </Typography>
                      {activeDay ? (
                        <Typography className={styles.sectionHint} type="body-xs">
                          {activeDay.weekdayLabel}
                        </Typography>
                      ) : null}
                    </div>
                    <div className={styles.slotsGrid}>
                      {slots.length > 0 ? (
                        slots.map((slot) => {
                          const selected = selectedSlotId === slot.id;
                          return (
                            <Button
                              className={[
                                styles.slot,
                                selected ? styles.slotSelected : "",
                                slot.state === "full" ? styles.slotDisabled : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              isDisabled={slot.state === "full"}
                              key={slot.id}
                              onPress={() => setSelectedSlotId(slot.id)}
                              size="lg"
                              variant="ghost"
                            >
                              <span
                                aria-hidden
                                className={[
                                  styles.slotIconWrap,
                                  selected ? styles.slotIconWrapSelected : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                <Clock size={SLOT_ICON_SIZE} />
                              </span>
                              <span className={styles.slotBody}>
                                <Typography
                                  className={styles.slotTime}
                                  type="body"
                                  weight="semibold"
                                >
                                  {slot.timeLabel}
                                </Typography>
                                <Typography
                                  className={[
                                    getCapacityClassName(slot.state),
                                    "inline-flex items-center gap-1",
                                  ].join(" ")}
                                  type="body-sm"
                                >
                                  <UsersTwo aria-hidden size={14} />
                                  {slot.capacityLabel}
                                </Typography>
                              </span>
                              {selected ? (
                                <Check
                                  aria-hidden
                                  className={styles.slotCheck}
                                  size={18}
                                />
                              ) : null}
                            </Button>
                          );
                        })
                      ) : (
                        <div className={styles.empty}>
                          <Typography className={styles.emptyBody} type="body-sm">
                            {t("emptySlots")}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              ) : null}

              {step === 1 ? (
                <section className={styles.section}>
                  <Typography
                    className={styles.sectionTitle}
                    type="h4"
                    weight="semibold"
                  >
                    {t("plansTitle")}
                  </Typography>
                  <div className={styles.plans}>
                    {plans.map((plan) => {
                      const selected = selectedPlanId === plan.id;
                      return (
                        <Button
                          className={[
                            styles.planCard,
                            selected ? styles.planCardSelected : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          key={plan.id}
                          onPress={() => setSelectedPlanId(plan.id)}
                          size="lg"
                          variant="ghost"
                        >
                          <span className={styles.planHeader}>
                            <span className={styles.planTitleBlock}>
                              <Typography
                                className={styles.planTitle}
                                type="body"
                                weight="semibold"
                              >
                                {plan.title}
                              </Typography>
                              <span className={styles.planPriceRow}>
                                <span className={styles.planPrice}>
                                  {plan.price.toLocaleString("en-US")}
                                </span>
                                {plan.priceSuffix ? (
                                  <span className={styles.planPriceSuffix}>
                                    {plan.priceSuffix}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            {selected ? (
                              <Check
                                aria-hidden
                                className={styles.planCheck}
                                size={20}
                              />
                            ) : null}
                          </span>
                          <Typography
                            className={styles.planDescription}
                            type="body-sm"
                          >
                            {plan.description}
                          </Typography>
                        </Button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section className={styles.section}>
                  <Typography
                    className={styles.sectionTitle}
                    type="h4"
                    weight="semibold"
                  >
                    {t("summaryTitle")}
                  </Typography>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                      <Typography className={styles.summaryLabel} type="body-sm">
                        {t("summaryClub")}
                      </Typography>
                      <Typography
                        className={styles.summaryValue}
                        type="body"
                        weight="medium"
                      >
                        {clubTitle || t("notSelected")}
                      </Typography>
                    </div>
                    <div className={styles.summaryRow}>
                      <Typography className={styles.summaryLabel} type="body-sm">
                        {t("summaryDay")}
                      </Typography>
                      <Typography
                        className={styles.summaryValue}
                        type="body"
                        weight="medium"
                      >
                        {activeDay
                          ? `${activeDay.weekdayLabel} ${activeDay.dayLabel}`
                          : t("notSelected")}
                      </Typography>
                    </div>
                    <div className={styles.summaryRow}>
                      <Typography className={styles.summaryLabel} type="body-sm">
                        {t("summarySlot")}
                      </Typography>
                      <Typography
                        className={styles.summaryValue}
                        type="body"
                        weight="medium"
                      >
                        {selectedSlot?.timeLabel ?? t("notSelected")}
                      </Typography>
                    </div>
                    <div className={styles.summaryRow}>
                      <Typography className={styles.summaryLabel} type="body-sm">
                        {t("summaryPlan")}
                      </Typography>
                      <Typography
                        className={styles.summaryValue}
                        type="body"
                        weight="medium"
                      >
                        {selectedPlan?.title ?? t("notSelected")}
                      </Typography>
                    </div>
                    <div
                      className={`${styles.summaryRow} ${styles.summaryTotalRow}`}
                    >
                      <Typography className={styles.summaryLabel} type="body-sm">
                        {t("summaryTotal")}
                      </Typography>
                      <Typography
                        className={styles.summaryTotalValue}
                        type="h4"
                        weight="bold"
                      >
                        {selectedPlan
                          ? `${selectedPlan.price.toLocaleString("en-US")} ${selectedPlan.priceSuffix ?? ""}`.trim()
                          : t("notSelected")}
                      </Typography>
                    </div>
                  </div>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <StickyBottomActions contentClassName={styles.footerRow}>
        <div className={styles.priceGroup}>
          <Typography className={styles.priceLabel} type="body-xs">
            {selectedPlan ? t("totalLabel") : t("selectPlanHint")}
          </Typography>
          <div className={styles.priceRow}>
            {selectedPlan ? (
              <span className={styles.pricePrefix}>{t("pricePrefix")}</span>
            ) : null}
            <NumberFlow
              className={styles.price}
              format={{ useGrouping: true }}
              locales="en-US"
              style={{ color: "var(--foreground)" }}
              value={displayPrice}
            />
            {selectedPlan || displayPrice > 0 ? (
              <span className={styles.priceSuffix}>{priceSuffix}</span>
            ) : null}
          </div>
        </div>

        <Button
          aria-label={ctaLabel}
          className={styles.confirm}
          isDisabled={step < 2 ? !canGoNext : !selectedSlot || !selectedPlan}
          onPress={goNext}
          size="lg"
          variant="primary"
        >
          <Typography
            className={styles.confirmLabel}
            type="body"
            weight="semibold"
          >
            {ctaLabel}
          </Typography>
          <ArrowForward2 aria-hidden className={styles.confirmIcon} size={18} />
        </Button>
      </StickyBottomActions>
    </div>
  );
}
