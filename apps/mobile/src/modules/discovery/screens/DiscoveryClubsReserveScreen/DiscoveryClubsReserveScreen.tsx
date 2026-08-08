"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FormStepper, type FormStepperStep } from "@repo/ui/kit/FormStepper";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReserveSlotState } from "../../lib/reserve-data";
import { discoveryClubsReserveScreenStyles as styles } from "./DiscoveryClubsReserveScreen.styles";
import type { DiscoveryClubsReserveScreenProps } from "./DiscoveryClubsReserveScreen.types";

const DEMO_INVOICE_ID = "inv-demo";

type ReserveStep = 0 | 1 | 2;

function getCapacityClassName(state: ReserveSlotState): string {
  if (state === "low") {
    return styles.slotCapacityLow;
  }
  if (state === "full") {
    return styles.slotCapacityFull;
  }
  return styles.slotCapacity;
}

export function DiscoveryClubsReserveScreen({
  clubTitle,
  days,
  slotsByDay,
  plans,
}: DiscoveryClubsReserveScreenProps) {
  const t = useTranslations("ReserveFlow");
  const router = useRouter();
  const [step, setStep] = useState<ReserveStep>(0);
  const [activeDayId, setActiveDayId] = useState(days[0]?.id ?? "");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

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

  const goNext = () => {
    setStep((prev) => (prev < 2 ? ((prev + 1) as ReserveStep) : prev));
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((prev) => (prev > 0 ? ((prev - 1) as ReserveStep) : prev));
  };

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          className="border-b-0 bg-background"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title", { club: clubTitle })}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <FormStepper
          activeIndex={step}
          aria-label={t("stepperLabel")}
          steps={steps}
        />

        {step === 0 ? (
          <>
            <section className={styles.section}>
              <Typography className={styles.sectionTitle} type="body-sm">
                {t("daysLabel")}
              </Typography>
              <div
                aria-label={t("daysLabel")}
                className={styles.days}
                role="group"
              >
                {days.map((day) => (
                  <Button
                    className={styles.dayChip}
                    key={day.id}
                    onPress={() => {
                      setActiveDayId(day.id);
                      setSelectedSlotId(null);
                    }}
                    variant={activeDayId === day.id ? "primary" : "ghost"}
                  >
                    <span className={styles.dayWeekday}>
                      {day.weekdayLabel}
                    </span>
                    <span className={styles.dayDate}>{day.dayLabel}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <Typography className={styles.sectionTitle} type="body-sm">
                {t("slotsTitle")}
              </Typography>
              <div className={styles.slotsGrid}>
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <Button
                      className={`${styles.slot} ${
                        selectedSlotId === slot.id ? styles.slotSelected : ""
                      }`}
                      isDisabled={slot.state === "full"}
                      key={slot.id}
                      onPress={() => setSelectedSlotId(slot.id)}
                      variant="ghost"
                    >
                      <Typography
                        className={styles.slotTime}
                        type="body"
                        weight="semibold"
                      >
                        {slot.timeLabel}
                      </Typography>
                      <Typography
                        className={getCapacityClassName(slot.state)}
                        type="body-sm"
                      >
                        {slot.capacityLabel}
                      </Typography>
                    </Button>
                  ))
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
            <Typography className={styles.sectionTitle} type="body-sm">
              {t("plansTitle")}
            </Typography>
            <div className={styles.plans}>
              {plans.map((plan) => (
                <Button
                  className={`${styles.planCard} ${
                    selectedPlanId === plan.id ? styles.planCardSelected : ""
                  }`}
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  variant="ghost"
                >
                  <span className={styles.planHeader}>
                    <Typography
                      className={styles.planTitle}
                      type="body"
                      weight="semibold"
                    >
                      {plan.title}
                    </Typography>
                    <Typography
                      className={styles.planPrice}
                      type="body"
                      weight="semibold"
                    >
                      {plan.priceLabel}
                    </Typography>
                  </span>
                  <Typography className={styles.planDescription} type="body-sm">
                    {plan.description}
                  </Typography>
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className={styles.section}>
            <Typography className={styles.sectionTitle} type="body-sm">
              {t("summaryTitle")}
            </Typography>
            <div className={styles.summaryCard}>
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
              <div aria-hidden className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <Typography className={styles.summaryLabel} type="body-sm">
                  {t("summaryTotal")}
                </Typography>
                <Typography
                  className={styles.summaryTotalValue}
                  type="h4"
                  weight="bold"
                >
                  {selectedPlan?.priceLabel ?? t("notSelected")}
                </Typography>
              </div>
            </div>
          </section>
        ) : null}

        <div className={styles.navRow}>
          <Button
            className={styles.navBack}
            size="lg"
            variant="outline"
            onPress={goBack}
          >
            {t("prevStep")}
          </Button>
          {step < 2 ? (
            <Button
              className={styles.navNext}
              isDisabled={!canGoNext}
              size="lg"
              variant="primary"
              onPress={goNext}
            >
              {t("nextStep")}
              <ArrowRight size={20} />
            </Button>
          ) : (
            <Button
              className={styles.navNext}
              isDisabled={!selectedSlot || !selectedPlan}
              size="lg"
              variant="primary"
              onPress={() =>
                router.push(`/athlete/payment/${DEMO_INVOICE_ID}`)
              }
            >
              {t("cta")}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
