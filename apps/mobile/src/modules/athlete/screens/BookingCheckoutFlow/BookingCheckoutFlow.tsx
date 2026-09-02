"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import {
  ApiError,
  useAvailabilitySlotsQuery,
  useCatalogOfferingsQuery,
  useCheckoutMutation,
  useCreateHoldMutation,
  useCreateQuoteMutation,
} from "@repo/api/v2";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearBookingCheckoutDraft,
  readBookingCheckoutDraft,
  saveBookingCheckoutDraft,
  type BookingCheckoutDraft,
} from "@/shared/lib/booking-checkout-draft";
import { useRouter } from "@/shared/lib/app-router";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const DAYS = 7;

type CatalogOffering = Record<string, unknown> & {
  profile?: { name?: string; type?: string };
  pricing?: { currency?: string; baseAmount?: number };
  bookingSettings?: { durationMinutes?: number };
  resourceRequirements?: Array<{ resourceId?: string; mode?: string }>;
};

const idOf = (value: Record<string, unknown>) => String(value._id ?? value.id ?? "");
const errorText = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;
const money = (minor: string | number | undefined) => {
  const value = typeof minor === "string" ? BigInt(minor || "0") : BigInt(minor ?? 0);
  return `${new Intl.NumberFormat("fa-IR").format(Number(value / BigInt(10)))} تومان`;
};
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
  }).format(new Date(value));

function Shell({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <AppLayout
      className="bg-background"
      header={<SecondaryPageHeader onBack={() => router.back()} title={title} />}
    >
      <div className="flex flex-col gap-5 pb-10 pt-3">
        <Typography className="text-primary" type="body-sm" weight="semibold">{step}</Typography>
        {children}
      </div>
    </AppLayout>
  );
}

function Notice({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <Typography
      className={`rounded-2xl p-4 ${danger ? "bg-danger/10 text-danger" : "bg-surface text-muted"}`}
      role={danger ? "alert" : "status"}
      type="body"
    >
      {children}
    </Typography>
  );
}

export function BookingServiceScreen() {
  const t = useTranslations("BookingCheckout");
  const router = useRouter();
  const params = useSearchParams();
  const branchId = params.get("branchId") ?? "";
  const valid = OBJECT_ID.test(branchId);
  const query = useCatalogOfferingsQuery(branchId, { limit: 50 }, { enabled: valid });
  const offerings = (query.data?.items ?? []) as CatalogOffering[];

  return (
    <Shell step={t("step", { current: 1, total: 4 })} title={t("serviceTitle")}>
      <div className="flex flex-col gap-2">
        <Typography type="h1" weight="bold">{t("serviceHeading")}</Typography>
        <Typography className="text-muted" type="body">{t("serviceDescription")}</Typography>
      </div>
      {!valid ? <Notice danger>{t("invalidBranch")}</Notice> : null}
      {query.isPending ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : null}
      {query.error ? <Notice danger>{errorText(query.error, t("loadError"))}</Notice> : null}
      <div className="flex flex-col gap-3">
        {offerings.map((offering) => {
          const offeringId = idOf(offering);
          const required = offering.resourceRequirements?.find((item) => item.mode !== "optional");
          const resourceId = String(required?.resourceId ?? "");
          return (
            <Button
              className="h-auto justify-between rounded-[22px] bg-surface px-4 py-4 text-start"
              isDisabled={!OBJECT_ID.test(offeringId) || !OBJECT_ID.test(resourceId)}
              key={offeringId}
              onPress={() => {
                const next = new URLSearchParams({
                  branchId,
                  offeringId,
                  resourceId,
                  duration: String(offering.bookingSettings?.durationMinutes ?? 60),
                  name: offering.profile?.name ?? t("serviceFallback"),
                });
                router.push(`/athlete/booking/time?${next.toString()}`);
              }}
              size="lg"
              variant="secondary"
            >
              <span className="flex min-w-0 flex-col items-start gap-1">
                <span className="font-semibold text-foreground">{offering.profile?.name ?? t("serviceFallback")}</span>
                <span className="text-sm text-muted">{money(offering.pricing?.baseAmount)}</span>
              </span>
            </Button>
          );
        })}
      </div>
      {!query.isPending && !query.error && valid && offerings.length === 0 ? (
        <Notice>{t("emptyServices")}</Notice>
      ) : null}
    </Shell>
  );
}

export function BookingTimeScreen() {
  const t = useTranslations("BookingCheckout");
  const router = useRouter();
  const params = useSearchParams();
  const branchId = params.get("branchId") ?? "";
  const offeringId = params.get("offeringId") ?? "";
  const resourceId = params.get("resourceId") ?? "";
  const name = params.get("name") ?? t("serviceFallback");
  const duration = Math.min(480, Math.max(15, Number(params.get("duration") ?? 60)));
  const valid = [branchId, offeringId, resourceId].every((id) => OBJECT_ID.test(id));
  const range = useMemo(() => {
    const from = new Date();
    const to = new Date(from.getTime() + DAYS * 86_400_000);
    return { from: from.toISOString(), to: to.toISOString(), duration_minutes: duration, participants: 1 };
  }, [duration]);
  const query = useAvailabilitySlotsQuery(resourceId, range, true, { enabled: valid });
  const slots = query.data?.slots.filter((slot) => slot.status === "available") ?? [];

  return (
    <Shell step={t("step", { current: 2, total: 4 })} title={t("timeTitle")}>
      <div className="flex flex-col gap-2">
        <Typography type="h1" weight="bold">{t("timeHeading")}</Typography>
        <Typography className="text-muted" type="body">{name}</Typography>
      </div>
      {!valid ? <Notice danger>{t("invalidSelection")}</Notice> : null}
      {query.isPending ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : null}
      {query.error ? <Notice danger>{errorText(query.error, t("loadError"))}</Notice> : null}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => (
          <Button
            className="h-auto rounded-[20px] bg-surface px-3 py-4"
            key={slot.startAt}
            onPress={() => {
              const next = new URLSearchParams({ branchId, offeringId, startsAt: slot.startAt, name });
              router.push(`/athlete/booking/review?${next.toString()}`);
            }}
            size="lg"
            variant="secondary"
          >
            <span className="flex flex-col gap-1 text-center">
              <span className="font-semibold">{dateTime(slot.startAt)}</span>
              <span className="text-xs text-muted">{t("capacity", { count: slot.capacity.available })}</span>
            </span>
          </Button>
        ))}
      </div>
      {!query.isPending && !query.error && valid && slots.length === 0 ? <Notice>{t("emptyTimes")}</Notice> : null}
    </Shell>
  );
}

export function BookingReviewScreen() {
  const t = useTranslations("BookingCheckout");
  const router = useRouter();
  const params = useSearchParams();
  const branchId = params.get("branchId") ?? "";
  const offeringId = params.get("offeringId") ?? "";
  const startsAt = params.get("startsAt") ?? "";
  const name = params.get("name") ?? t("serviceFallback");
  const valid = OBJECT_ID.test(branchId) && OBJECT_ID.test(offeringId) && Number.isFinite(new Date(startsAt).getTime());
  const quote = useCreateQuoteMutation();
  const hold = useCreateHoldMutation();
  const pending = quote.isPending || hold.isPending;
  const error = quote.error ?? hold.error;

  const continueToPayment = async () => {
    if (!valid || pending) return;
    try {
      const createdQuote = await quote.mutateAsync({
        input: { offering_id: offeringId, branch_id: branchId, starts_at: startsAt, participants: [{ kind: "self" }] },
      });
      const quoteId = idOf(createdQuote);
      if (!OBJECT_ID.test(quoteId)) throw new Error(t("submitError"));
      const createdHold = await hold.mutateAsync({ quoteId });
      saveBookingCheckoutDraft({
        holdToken: createdHold.holdToken,
        holdExpiresAt: createdHold.hold.expiresAt,
        branchId,
        offeringId,
        offeringName: name,
        startsAt,
        totalMinor: createdHold.hold.pricing.totalMinor,
        currency: createdHold.hold.pricing.currency,
      });
      router.push("/athlete/booking/payment");
    } catch {
      // React Query exposes the localized mutation error below.
    }
  };

  return (
    <Shell step={t("step", { current: 3, total: 4 })} title={t("reviewTitle")}>
      <Typography type="h1" weight="bold">{t("reviewHeading")}</Typography>
      <section className="overflow-hidden rounded-[24px] bg-surface">
        <div className="flex justify-between gap-4 px-4 py-4"><Typography className="text-muted" type="body-sm">{t("service")}</Typography><Typography type="body" weight="semibold">{name}</Typography></div>
        <div className="mx-4 h-px bg-border" />
        <div className="flex justify-between gap-4 px-4 py-4"><Typography className="text-muted" type="body-sm">{t("time")}</Typography><Typography type="body-sm">{valid ? dateTime(startsAt) : "—"}</Typography></div>
        <div className="mx-4 h-px bg-border" />
        <div className="flex justify-between gap-4 px-4 py-4"><Typography className="text-muted" type="body-sm">{t("participant")}</Typography><Typography type="body-sm">{t("myself")}</Typography></div>
      </section>
      {!valid ? <Notice danger>{t("invalidSelection")}</Notice> : null}
      {error ? <Notice danger>{errorText(error, t("submitError"))}</Notice> : null}
      <Button fullWidth isDisabled={!valid || pending} isPending={pending} onPress={() => void continueToPayment()} size="lg" variant="primary">
        {pending ? t("reserving") : t("continueToPayment")}
      </Button>
    </Shell>
  );
}

export function BookingPaymentScreen() {
  const t = useTranslations("BookingCheckout");
  const router = useRouter();
  const [draft, setDraft] = useState<BookingCheckoutDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<"sandbox_gateway" | "wallet">("sandbox_gateway");
  const checkout = useCheckoutMutation();

  useEffect(() => {
    setDraft(readBookingCheckoutDraft());
    setReady(true);
  }, []);

  const pay = async () => {
    if (!draft || checkout.isPending) return;
    try {
      const result = await checkout.mutateAsync({ holdToken: draft.holdToken, paymentMethod: method });
      clearBookingCheckoutDraft();
      if (result.nextAction?.type === "mock_gateway") {
        const next = new URLSearchParams({ paymentId: result.nextAction.paymentId, returnPath: "/athlete/bookings" });
        router.replace(`/athlete/payment/test?${next.toString()}`);
        return;
      }
      router.replace("/athlete/bookings");
    } catch {
      // React Query exposes the localized mutation error below.
    }
  };

  return (
    <Shell step={t("step", { current: 4, total: 4 })} title={t("paymentTitle")}>
      {!ready ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : null}
      {ready && !draft ? <Notice danger>{t("expiredDraft")}</Notice> : null}
      {draft ? (
        <>
          <section className="flex flex-col gap-2 rounded-[24px] bg-surface p-5">
            <Typography type="h2" weight="bold">{draft.offeringName}</Typography>
            <Typography className="text-muted" type="body-sm">{dateTime(draft.startsAt)}</Typography>
            <Typography className="mt-2 text-primary" type="h2" weight="bold">{money(draft.totalMinor)}</Typography>
          </section>
          <div className="flex flex-col gap-3">
            <Button fullWidth onPress={() => setMethod("sandbox_gateway")} size="lg" variant={method === "sandbox_gateway" ? "primary" : "secondary"}>{t("testGateway")}</Button>
            <Button fullWidth onPress={() => setMethod("wallet")} size="lg" variant={method === "wallet" ? "primary" : "secondary"}>{t("wallet")}</Button>
          </div>
          <Notice>{t("paymentHint")}</Notice>
          {checkout.error ? <Notice danger>{errorText(checkout.error, t("paymentError"))}</Notice> : null}
          <Button fullWidth isDisabled={checkout.isPending || new Date(draft.holdExpiresAt) <= new Date()} isPending={checkout.isPending} onPress={() => void pay()} size="lg" variant="primary">
            {checkout.isPending ? t("processing") : t("pay")}
          </Button>
        </>
      ) : null}
    </Shell>
  );
}
