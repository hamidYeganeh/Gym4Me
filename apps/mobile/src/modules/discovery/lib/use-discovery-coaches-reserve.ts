"use client";

import { ApiError } from "@repo/api";
import type { FormStepperStep } from "@repo/ui/kit/FormStepper";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import {
  accountBookings,
  accountProfile,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import {
  formatJalaliDateShort,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "./club-calendar-data";
import type { CoachDetail } from "./coach-detail-data";
import {
  consultationTypesFromPricing,
  useDiscoveryCoachSlotsWeek,
} from "./use-discovery-coach-slots";
import type { ReserveStep } from "../screens/DiscoveryCoachesReserveScreen/DiscoveryCoachesReserveScreen.types";
import { useRouter } from "@/shared/lib/app-router";

export const COACH_RESERVE_NOTE_MAX = 300;

export const COACH_RESERVE_MEDICAL_CONDITION_KEYS = [
  "heart",
  "bloodPressure",
  "diabetes",
  "asthma",
  "injury",
] as const;

export const COACH_RESERVE_SUPPLEMENT_KEYS = [
  "protein",
  "creatine",
  "vitamins",
  "preWorkout",
] as const;

export function toggleCoachReserveKey(list: string[], key: string): string[] {
  return list.includes(key)
    ? list.filter((entry) => entry !== key)
    : [...list, key];
}

export function useDiscoveryCoachesReserve(coach: CoachDetail) {
  const t = useTranslations("CoachReserve");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { runWithAuth, isAuthenticated, isReady } = useRequireAuthAction();
  const stepDirection = useRef(1);
  const bookingAttemptKey = useRef<string | null>(null);
  const isApi = isDiscoveryApiId(coach.id);

  const [step, setStep] = useState<ReserveStep>(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [conditionKeys, setConditionKeys] = useState<string[]>([]);
  const [supplementKeys, setSupplementKeys] = useState<string[]>([]);

  const today = useMemo(() => todayIso(), []);
  const [anchor, setAnchor] = useState(today);
  const week = useDiscoveryCoachSlotsWeek(coach.id, anchor);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    searchParams.get("slotId") ?? undefined,
  );

  const consultationOptions = useMemo(() => {
    if (coach.consultationTypes.length > 0) return coach.consultationTypes;
    return consultationTypesFromPricing(week.pricing);
  }, [coach.consultationTypes, week.pricing]);

  const [selectedConsultationId, setSelectedConsultationId] = useState<
    string | undefined
  >();
  const selectedConsultation =
    consultationOptions.find(
      (option) => option.id === selectedConsultationId,
    ) ??
    consultationOptions.find((option) => option.status === "available") ??
    consultationOptions[0];

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || isAuthenticated) return;
    runWithAuth(() => undefined, pathname);
  }, [isAuthenticated, isReady, pathname, runWithAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void accountProfile
      .getMe()
      .then((me) => {
        setFullName(
          (prev) =>
            prev ||
            [me.name?.first, me.name?.last].filter(Boolean).join(" ").trim(),
        );
        setPhone((prev) => prev || (me.phone ?? ""));
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  const range = weekRangeContaining(anchor);
  const selectedSlot = useMemo(() => {
    for (const day of week.days) {
      const slot = day.slots.find(
        (entry) => entry.id === selectedSlotId && entry.status === "available",
      );
      if (slot) return slot;
    }
    return null;
  }, [selectedSlotId, week.days]);

  const availabilityDays = useMemo(
    () =>
      week.days
        .filter((day) => day.slots.length > 0)
        .map((day) => ({
          id: day.id,
          label:
            day.date === today
              ? t("today")
              : `${t(`weekday.${weekdayKey(weekdaySat0(day.date))}`)} ${formatJalaliDateShort(day.date)}`,
          slots: day.slots.map((slot) => ({
            id: slot.id,
            timeLabel: slot.timeLabel,
            status: slot.status,
          })),
        })),
    [t, today, week.days],
  );

  const steps: FormStepperStep[] = useMemo(
    () => [
      { key: "info", label: t("stepInfo") },
      { key: "time", label: t("stepTime") },
      { key: "payment", label: t("stepPayment") },
    ],
    [t],
  );

  const price = selectedConsultation?.price ?? 0;

  const canGoNext =
    step === 0
      ? fullName.trim().length > 1
      : step === 1
        ? Boolean(selectedSlot && selectedConsultation)
        : !isSubmitting;

  const submitBooking = async () => {
    if (!selectedSlot || !selectedConsultation) return;
    if (!isApi) {
      router.push("/athlete/payment/inv-demo");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const idempotencyKey =
        bookingAttemptKey.current ??
        `coach-booking:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
      bookingAttemptKey.current = idempotencyKey;
      const booking = await accountBookings.create({
        coachUserId: coach.id,
        slotId: selectedSlot.id,
        consultationKind:
          selectedConsultation.kind === "remote" ? "remote" : "in_person",
        intake: {
          note: note.trim() || undefined,
          medicalConditionKeys: conditionKeys,
          supplementKeys,
        },
        couponCode: appliedCoupon ?? undefined,
        idempotencyKey,
      });
      bookingAttemptKey.current = null;
      if (booking.status === "confirmed" || booking.status === "pending") {
        router.replace(`/athlete/bookings/${booking.id}`);
        return;
      }
      const payment = await accountBookings.pay(
        booking.id,
        `${window.location.origin}/athlete/bookings/${booking.id}`,
      );
      window.location.assign(payment.redirectUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("submitError"));
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 2) {
      runWithAuth(() => void submitBooking(), pathname);
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

  const ctaLabel =
    step < 2
      ? t("nextStep")
      : isSubmitting
        ? t("submitting")
        : t("payAndReserve");

  return {
    isReady,
    isAuthenticated,
    step,
    stepDirection,
    steps,
    goBack,
    goNext,
    coach,
    fullName,
    setFullName,
    phone,
    setPhone,
    note,
    setNote,
    conditionKeys,
    setConditionKeys,
    supplementKeys,
    setSupplementKeys,
    consultationOptions,
    selectedConsultation,
    selectedConsultationId: selectedConsultation?.id,
    setSelectedConsultationId,
    range,
    anchor,
    setAnchor,
    week,
    availabilityDays,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    coupon,
    setCoupon,
    appliedCoupon,
    setAppliedCoupon,
    error,
    price,
    canGoNext,
    ctaLabel,
    isSubmitting,
  };
}
