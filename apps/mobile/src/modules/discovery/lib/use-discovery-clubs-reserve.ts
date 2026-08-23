"use client";

import type { FormStepperStep } from "@repo/ui/kit/FormStepper";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import type { ReserveDay, ReservePlan, ReserveSlot } from "./reserve-data";
import { useRouter } from "@/shared/lib/app-router";

export type ClubsReserveStep = 0 | 1 | 2;

export type UseDiscoveryClubsReserveArgs = {
  days: ReserveDay[];
  slotsByDay: Record<string, ReserveSlot[]>;
  plans: ReservePlan[];
  onConfirm?: (selection: {
    slot: ReserveSlot;
    plan: ReservePlan;
  }) => Promise<void>;
};

export function useDiscoveryClubsReserve({
  days,
  slotsByDay,
  plans,
  onConfirm,
}: UseDiscoveryClubsReserveArgs) {
  const t = useTranslations("ReserveFlow");
  const router = useRouter();
  const pathname = usePathname();
  const { runWithAuth, isAuthenticated, isReady } = useRequireAuthAction();
  const stepDirection = useRef(1);
  const [step, setStep] = useState<ClubsReserveStep>(0);
  const [activeDayId, setActiveDayId] = useState(
    () =>
      days.find((day) => day.availability === "available")?.id ??
      days[0]?.id ??
      "",
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const getPlanPrice = (plan: ReservePlan): number =>
    plan.sessionCount != null && selectedSlot?.api
      ? selectedSlot.api.price * plan.sessionCount
      : plan.price;

  const canGoNext =
    step === 0
      ? Boolean(selectedSlot)
      : step === 1
        ? Boolean(selectedPlan)
        : !isSubmitting;

  const submitReservation = async () => {
    if (!selectedSlot || !selectedPlan) return;
    if (!onConfirm) {
      setSubmitError(t("submitError"));
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onConfirm({ slot: selectedSlot, plan: selectedPlan });
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : t("submitError"),
      );
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 2) {
      runWithAuth(() => void submitReservation(), pathname);
      return;
    }
    stepDirection.current = 1;
    setStep((prev) => (prev < 2 ? ((prev + 1) as ClubsReserveStep) : prev));
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    stepDirection.current = -1;
    setStep((prev) => (prev > 0 ? ((prev - 1) as ClubsReserveStep) : prev));
  };

  const displayPrice = selectedPlan ? getPlanPrice(selectedPlan) : 0;
  const priceSuffix = selectedPlan?.priceSuffix ?? t("priceSuffix");
  const ctaLabel = step < 2 ? t("nextStep") : t("cta");

  const onDayPress = (dayId: string) => {
    setActiveDayId(dayId);
    setSelectedSlotId(null);
  };

  return {
    isReady,
    isAuthenticated,
    step,
    stepDirection,
    steps,
    goBack,
    goNext,
    days,
    plans,
    activeDay,
    activeDayId,
    onDayPress,
    slots,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    selectedPlanId,
    setSelectedPlanId,
    selectedPlan,
    getPlanPrice,
    canGoNext,
    displayPrice,
    priceSuffix,
    ctaLabel,
    isSubmitting,
    submitError,
  };
}
