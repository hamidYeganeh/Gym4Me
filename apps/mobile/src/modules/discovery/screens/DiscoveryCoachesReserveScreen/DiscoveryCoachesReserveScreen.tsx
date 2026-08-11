"use client";

import {
  Avatar,
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ApiError } from "@repo/api";
import { ArrowForward2 } from "@repo/icons/ArrowForward2";
import { Check } from "@repo/icons/Check";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { Video } from "@repo/icons/Video";
import { duration, ease } from "@repo/theme";
import { CoachAvailabilitySlots } from "@repo/ui/cards/CoachAvailabilitySlots";
import { CoachConsultationType } from "@repo/ui/cards/CoachConsultationType";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { FormStepper, type FormStepperStep } from "@repo/ui/kit/FormStepper";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCoachSlotsWeek } from "@/shared/hooks/useCoachSlotsWeek";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import {
  accountBookings,
  accountProfile,
  isDiscoveryApiId,
} from "@/shared/lib/api";
import {
  addDaysIso,
  formatJalaliDateShort,
  formatJalaliRangeLabel,
  todayIso,
  weekdayKey,
  weekdaySat0,
  weekRangeContaining,
} from "../../lib/club-calendar-data";
import {
  consultationTypesFromPricing,
  useDiscoveryCoachSlotsWeek,
} from "../../lib/use-discovery-coach-slots";
import { discoveryCoachesReserveScreenStyles as styles } from "./DiscoveryCoachesReserveScreen.styles";
import type {
  DiscoveryCoachesReserveScreenProps,
  ReserveStep,
} from "./DiscoveryCoachesReserveScreen.types";

const NOTE_MAX = 300;

const MEDICAL_CONDITION_KEYS = [
  "heart",
  "bloodPressure",
  "diabetes",
  "asthma",
  "injury",
] as const;

const SUPPLEMENT_KEYS = [
  "protein",
  "creatine",
  "vitamins",
  "preWorkout",
] as const;

const stepSlideVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
};

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}

function toggleKey(list: string[], key: string): string[] {
  return list.includes(key)
    ? list.filter((entry) => entry !== key)
    : [...list, key];
}

export function DiscoveryCoachesReserveScreen({
  coach,
}: DiscoveryCoachesReserveScreenProps) {
  const t = useTranslations("CoachReserve");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { runWithAuth, isAuthenticated, isReady } = useRequireAuthAction();
  const reduceMotion = useReducedMotion();
  const stepDirection = useRef(1);
  const isApi = isDiscoveryApiId(coach.id);

  const [step, setStep] = useState<ReserveStep>(0);

  // Step 0 — personal info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [conditionKeys, setConditionKeys] = useState<string[]>([]);
  const [supplementKeys, setSupplementKeys] = useState<string[]>([]);

  // Step 1 — date & time
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

  // Step 2 — payment
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
        setFullName((prev) =>
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
      });
      if (booking.status === "confirmed") {
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

  const ctaLabel =
    step < 2 ? t("nextStep") : isSubmitting ? t("submitting") : t("payAndReserve");

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
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={goBack}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />

        <div className={styles.main}>
          <div className={styles.coachRow}>
            <Avatar className={styles.avatar} size="lg">
              <Avatar.Image
                alt={coach.name}
                src={coach.avatar?.trim() || PLACEHOLDER_IMAGE}
              />
              <Avatar.Fallback>{initialsFromName(coach.name)}</Avatar.Fallback>
            </Avatar>
            <div className={styles.coachMeta}>
              <Typography className={styles.coachName} weight="bold">
                {coach.name}
              </Typography>
              <Typography className={styles.coachSpecialty} type="body-sm">
                {coach.specialty}
              </Typography>
            </div>
            {coach.rating > 0 ? (
              <div className={styles.rating}>
                <Typography className={styles.ratingValue} weight="semibold">
                  {formatRating(coach.rating)}
                </Typography>
                <StarFull aria-hidden className={styles.ratingStar} size={16} />
              </div>
            ) : null}
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
                    <Typography
                      className={styles.sectionTitle}
                      type="h4"
                      weight="semibold"
                    >
                      {t("infoTitle")}
                    </Typography>
                    <div className={styles.fields}>
                      <TextField
                        fullWidth
                        name="fullName"
                        onChange={setFullName}
                        value={fullName}
                      >
                        <Label>{t("fullName")}</Label>
                        <Input />
                      </TextField>
                      <TextField
                        fullWidth
                        isDisabled={Boolean(phone)}
                        name="phone"
                        onChange={setPhone}
                        value={phone}
                      >
                        <Label>{t("phone")}</Label>
                        <Input dir="ltr" inputMode="tel" />
                      </TextField>
                    </div>
                  </section>

                  <section className={styles.section}>
                    <Typography
                      className={styles.sectionTitle}
                      type="h4"
                      weight="semibold"
                    >
                      {t("conditionsTitle")}
                    </Typography>
                    <Typography className={styles.sectionHint} type="body-sm">
                      {t("conditionsHint")}
                    </Typography>
                    <FilterChipBar aria-label={t("conditionsTitle")}>
                      {MEDICAL_CONDITION_KEYS.map((key) => (
                        <FilterChip
                          key={key}
                          onPress={() =>
                            setConditionKeys((prev) => toggleKey(prev, key))
                          }
                          selected={conditionKeys.includes(key)}
                        >
                          {t(`conditions.${key}`)}
                        </FilterChip>
                      ))}
                    </FilterChipBar>
                  </section>

                  <section className={styles.section}>
                    <Typography
                      className={styles.sectionTitle}
                      type="h4"
                      weight="semibold"
                    >
                      {t("supplementsTitle")}
                    </Typography>
                    <FilterChipBar aria-label={t("supplementsTitle")}>
                      {SUPPLEMENT_KEYS.map((key) => (
                        <FilterChip
                          key={key}
                          onPress={() =>
                            setSupplementKeys((prev) => toggleKey(prev, key))
                          }
                          selected={supplementKeys.includes(key)}
                        >
                          {t(`supplements.${key}`)}
                        </FilterChip>
                      ))}
                    </FilterChipBar>
                  </section>

                  <section className={styles.section}>
                    <TextField
                      fullWidth
                      name="note"
                      onChange={(value) => setNote(value.slice(0, NOTE_MAX))}
                      value={note}
                    >
                      <Label>{t("noteLabel")}</Label>
                      <Input placeholder={t("notePlaceholder")} />
                    </TextField>
                    <Typography className={styles.noteCount} type="body-xs">
                      {t("noteCount", { count: note.length, max: NOTE_MAX })}
                    </Typography>
                  </section>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  {consultationOptions.length > 0 ? (
                    <CoachConsultationType
                      onOptionPress={(option) =>
                        setSelectedConsultationId(option.id)
                      }
                      options={consultationOptions.map((option) => ({
                        id: option.id,
                        kind: option.kind,
                        title: t(
                          option.kind === "remote"
                            ? "consultationRemote"
                            : "consultationInPerson",
                        ),
                        status: option.status,
                        statusLabel: t(
                          option.status === "available"
                            ? "consultationAvailable"
                            : "consultationUnavailable",
                        ),
                        price: option.price.toLocaleString("fa-IR"),
                        priceSuffix: t("priceSuffix"),
                      }))}
                      selectedId={selectedConsultation?.id}
                      title={t("consultationTitle")}
                    />
                  ) : null}

                  <div className={styles.weekRow}>
                    <Typography className={styles.weekLabel} weight="bold">
                      {formatJalaliRangeLabel(range.from, range.to)}
                    </Typography>
                    <div className={styles.weekNav}>
                      <Button
                        aria-label={t("prevWeek")}
                        className={styles.weekButton}
                        isIconOnly
                        onPress={() => setAnchor(addDaysIso(range.from, -7))}
                        size="lg"
                      >
                        <ChevronRight
                          aria-hidden
                          className={styles.weekButtonIcon}
                          rtlMirror={false}
                          size={18}
                        />
                      </Button>
                      <Button
                        aria-label={t("nextWeek")}
                        className={styles.weekButton}
                        isIconOnly
                        onPress={() => setAnchor(addDaysIso(range.from, 7))}
                        size="lg"
                      >
                        <ChevronLeft
                          aria-hidden
                          className={styles.weekButtonIcon}
                          rtlMirror={false}
                          size={18}
                        />
                      </Button>
                    </div>
                  </div>

                  {availabilityDays.length > 0 ? (
                    <CoachAvailabilitySlots
                      availableLabel={t("slotAvailable")}
                      days={availabilityDays}
                      onSlotPress={(slot) => setSelectedSlotId(slot.id)}
                      selectedSlotId={selectedSlotId}
                      title={t("slotsTitle")}
                      unavailableLabel={t("slotUnavailable")}
                    />
                  ) : (
                    <div className={styles.emptySlots}>
                      <Typography type="body-sm">
                        {week.isLoading ? t("slotsLoading") : t("slotsEmpty")}
                      </Typography>
                    </div>
                  )}

                  {selectedConsultation?.kind === "remote" ? (
                    <div className={styles.remoteHint}>
                      <Typography type="body-sm">
                        <Video aria-hidden className="me-1 inline" size={16} />
                        {t("remoteHint")}
                      </Typography>
                    </div>
                  ) : selectedSlot?.clubName ? (
                    <div className={styles.locationCard}>
                      <Typography
                        className={styles.locationTitle}
                        type="body"
                        weight="semibold"
                      >
                        <MapPin1 aria-hidden className="me-1 inline" size={16} />
                        {t("locationTitle", { club: selectedSlot.clubName })}
                      </Typography>
                      {selectedSlot.clubAddress ? (
                        <Typography
                          className={styles.locationAddress}
                          type="body-sm"
                        >
                          {selectedSlot.clubAddress}
                        </Typography>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <section className={styles.section}>
                    <Typography
                      className={styles.sectionTitle}
                      type="h4"
                      weight="semibold"
                    >
                      {t("paymentMethodTitle")}
                    </Typography>
                    <div className={styles.methodCard}>
                      <div className={styles.methodBody}>
                        <Typography
                          className={styles.methodTitle}
                          type="body"
                          weight="semibold"
                        >
                          {t("paymentGateway")}
                        </Typography>
                        <Typography className={styles.methodHint} type="body-sm">
                          {t("paymentGatewayHint")}
                        </Typography>
                      </div>
                      <Check aria-hidden className={styles.methodCheck} size={20} />
                    </div>
                  </section>

                  <section className={styles.section}>
                    <div className={styles.couponRow}>
                      <TextField
                        className={styles.couponField}
                        fullWidth
                        name="coupon"
                        onChange={setCoupon}
                        value={coupon}
                      >
                        <Label>{t("couponLabel")}</Label>
                        <Input dir="ltr" placeholder={t("couponPlaceholder")} />
                      </TextField>
                      <Button
                        className={styles.couponApply}
                        isDisabled={!coupon.trim()}
                        onPress={() => setAppliedCoupon(coupon.trim())}
                        size="lg"
                        variant="secondary"
                      >
                        {appliedCoupon === coupon.trim() && appliedCoupon
                          ? t("couponApplied")
                          : t("couponApply")}
                      </Button>
                    </div>
                  </section>

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
                          {t("summaryConsultation")}
                        </Typography>
                        <Typography
                          className={styles.summaryValue}
                          type="body"
                          weight="medium"
                        >
                          {selectedConsultation
                            ? t(
                                selectedConsultation.kind === "remote"
                                  ? "consultationRemote"
                                  : "consultationInPerson",
                              )
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
                          {selectedSlot
                            ? `${formatJalaliDateShort(selectedSlot.date)} — ${selectedSlot.timeLabel}`
                            : t("notSelected")}
                        </Typography>
                      </div>
                      {selectedSlot?.clubName &&
                      selectedConsultation?.kind !== "remote" ? (
                        <div className={styles.summaryRow}>
                          <Typography
                            className={styles.summaryLabel}
                            type="body-sm"
                          >
                            {t("summaryLocation")}
                          </Typography>
                          <Typography
                            className={styles.summaryValue}
                            type="body"
                            weight="medium"
                          >
                            {selectedSlot.clubName}
                          </Typography>
                        </div>
                      ) : null}
                      <div className={styles.summaryRow}>
                        <Typography className={styles.summaryLabel} type="body-sm">
                          {t("summaryPrice")}
                        </Typography>
                        <Typography
                          className={styles.summaryValue}
                          type="body"
                          weight="medium"
                        >
                          {price.toLocaleString("fa-IR")} {t("priceSuffix")}
                        </Typography>
                      </div>
                      <div className={styles.summaryRow}>
                        <Typography className={styles.summaryLabel} type="body-sm">
                          {t("summaryDiscount")}
                        </Typography>
                        <Typography
                          className={styles.summaryValue}
                          type="body"
                          weight="medium"
                        >
                          {(0).toLocaleString("fa-IR")} {t("priceSuffix")}
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
                          {price.toLocaleString("fa-IR")} {t("priceSuffix")}
                        </Typography>
                      </div>
                    </div>
                  </section>

                  {error ? (
                    <Typography className={styles.errorText} type="body-sm">
                      {error}
                    </Typography>
                  ) : null}
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <StickyBottomActions contentClassName={styles.footerRow}>
        <div className={styles.priceGroup}>
          <Typography className={styles.priceLabel} type="body-xs">
            {t("totalLabel")}
          </Typography>
          <div className={styles.priceRow}>
            <NumberFlow
              className={styles.price}
              format={{ useGrouping: true }}
              locales="fa-IR"
              value={price}
            />
            <span className={styles.priceSuffix}>{t("priceSuffix")}</span>
          </div>
        </div>

        <Button
          aria-label={ctaLabel}
          className={styles.confirm}
          isDisabled={!canGoNext || (step === 2 && !selectedSlot)}
          isPending={isSubmitting}
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
          <ArrowForward2 aria-hidden size={18} />
        </Button>
      </StickyBottomActions>
    </div>
  );
}
