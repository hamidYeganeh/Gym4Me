"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ApiError, useMockPaymentDecisionMutation, useMockPaymentQuery } from "@repo/api/v2";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { isPaymentReturnPath } from "@/shared/lib/payment-return";
import { useRouter } from "@/shared/lib/app-router";

const OBJECT_ID = /^[a-f\d]{24}$/i;

function amountLabel(amountMinor: string | undefined, currency: string | undefined) {
  if (!amountMinor) return "—";
  const amount = Number(BigInt(amountMinor) / BigInt(10));
  return `${new Intl.NumberFormat("fa-IR").format(amount)} تومان${currency && currency !== "IRR" ? ` (${currency})` : ""}`;
}

export function TestPaymentGatewayScreen() {
  const t = useTranslations("Payment.testGateway");
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? "";
  const rawReturnPath = searchParams.get("returnPath") ?? "/athlete/bookings";
  const returnPath = isPaymentReturnPath(rawReturnPath) ? rawReturnPath : "";
  const valid = OBJECT_ID.test(paymentId) && Boolean(returnPath);
  const payment = useMockPaymentQuery(paymentId, { enabled: valid });
  const decision = useMockPaymentDecisionMutation();
  const pending = decision.isPending;

  const resultPath = useMemo(() => {
    const params = new URLSearchParams({ reference: paymentId });
    return `/athlete/payment/result?${params.toString()}`;
  }, [paymentId]);

  const decide = (value: "approve" | "cancel") => {
    if (!valid || pending) return;
    decision.mutate(
      { paymentId, decision: value },
      {
        onSuccess: () => {
          if (value === "approve") {
            router.replace(`${resultPath}&status=success&returnPath=${encodeURIComponent(returnPath)}`);
            return;
          }
          router.replace(`${resultPath}&status=cancelled&returnPath=${encodeURIComponent(returnPath)}`);
        },
      },
    );
  };

  const error = payment.error ?? decision.error;
  const errorText =
    error instanceof ApiError ? error.message : error ? t("loadError") : null;
  const decided = payment.data && payment.data.status !== "pending";

  return (
    <AppLayout
      className="bg-background"
      header={<SecondaryPageHeader onBack={() => router.back()} title={t("pageTitle")} />}
    >
      <div className="flex flex-col gap-6 pb-10 pt-4">
        <section className="flex flex-col gap-2 rounded-[28px] bg-surface p-5">
          <Typography className="text-primary" type="body-sm" weight="semibold">
            {t("eyebrow")}
          </Typography>
          <Typography type="h1" weight="bold">{t("title")}</Typography>
          <Typography className="text-muted" type="body">{t("description")}</Typography>
        </section>

        {!valid ? (
          <Typography className="rounded-2xl bg-danger/10 p-4 text-danger" role="alert" type="body">
            {t("invalid")}
          </Typography>
        ) : payment.isPending ? (
          <Typography className="rounded-2xl bg-surface p-4 text-muted" type="body">
            {t("processing")}
          </Typography>
        ) : payment.data ? (
          <section className="overflow-hidden rounded-[24px] bg-surface">
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <Typography className="text-muted" type="body-sm">{t("amount")}</Typography>
              <Typography type="body" weight="semibold">
                {amountLabel(payment.data.amount.amountMinor, payment.data.amount.currency)}
              </Typography>
            </div>
            <div className="mx-4 h-px bg-border" />
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <Typography className="text-muted" type="body-sm">{t("reference")}</Typography>
              <Typography className="break-all text-end" dir="ltr" type="body-sm">
                {paymentId}
              </Typography>
            </div>
            {payment.data.expiresAt ? (
              <>
                <div className="mx-4 h-px bg-border" />
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <Typography className="text-muted" type="body-sm">{t("expires")}</Typography>
                  <Typography type="body-sm">
                    {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.data.expiresAt))}
                  </Typography>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {decided ? (
          <Typography className="rounded-2xl bg-warning/10 p-4 text-warning" role="status" type="body">
            {t("alreadyDecided")}
          </Typography>
        ) : null}
        {errorText ? (
          <Typography className="rounded-2xl bg-danger/10 p-4 text-danger" role="alert" type="body">
            {errorText}
          </Typography>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            fullWidth
            isDisabled={!valid || !payment.data || decided || pending}
            isPending={pending}
            onPress={() => decide("approve")}
            size="lg"
            variant="primary"
          >
            {pending ? t("processing") : t("approve")}
          </Button>
          <Button
            fullWidth
            isDisabled={!valid || !payment.data || decided || pending}
            onPress={() => decide("cancel")}
            size="lg"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
