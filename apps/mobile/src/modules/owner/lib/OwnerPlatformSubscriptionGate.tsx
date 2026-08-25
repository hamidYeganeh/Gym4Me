"use client";

import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import {
  ApiError,
  type PlatformSubscriptionCheckoutPreview,
} from "@repo/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AthleteSubscriptionScreen } from "@/modules/athlete/screens/AthleteSubscriptionScreen";
import type { SubscriptionPlan } from "@/modules/athlete/lib/athlete-subscription-data";
import { accountMemberships } from "@/shared/lib/api";
import { useRouter } from "@/shared/lib/app-router";
import { useAuth } from "@/shared/providers/AuthProvider";
import { getPaymentCallbackUrl } from "@/shared/lib/payment-return";

export function OwnerPlatformSubscriptionGate() {
  const t = useTranslations("OwnerPlatformSubscription");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] =
    useState<PlatformSubscriptionCheckoutPreview | null>(null);
  const [attemptKey, setAttemptKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const reload = useCallback(async () => {
    const [catalog, subscriptions] = await Promise.all([
      accountMemberships.listPlatformPlans(),
      accountMemberships.listPlatformSubscriptions(),
    ]);
    setPlans(
      catalog.result.map((plan) => ({
        id: plan.id,
        tier: plan.pricing.amount === 0 ? "free" : "club",
        name: plan.name,
        priceLabel: `${new Intl.NumberFormat("fa-IR").format(plan.pricing.amount)} ${
          plan.pricing.currency === "IRT"
            ? t("currencyIrt")
            : plan.pricing.currency
        }`,
        periodLabel: t("periodDays", { count: plan.pricing.periodDays }),
        features: plan.features,
      })),
    );
    const current = subscriptions.result.find(
      (subscription) =>
        subscription.status === "active" || subscription.status === "trialing",
    );
    setCurrentPlanId(current?.planId ?? "");
  }, [t]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setPlans([]);
      setError(t("unauthorized"));
      return;
    }
    let cancelled = false;
    const bootstrap = async () => {
      const checkoutId = searchParams.get("platformCheckoutId");
      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");
      if (
        checkoutId &&
        authority &&
        (status === "OK" || status === "NOK")
      ) {
        setPending(true);
        await accountMemberships.verifyPlatformSubscriptionCheckout(
          checkoutId,
          { authority, status },
        );
        if (cancelled) return;
        router.replace("/owner/subscription");
      }
      await reload();
    };
    bootstrap()
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof ApiError ? cause.message : t("loadError"));
        setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeRole, isAuthenticated, isReady, reload, router, searchParams, t]);

  const openCheckout = useCallback(
    async (planId: string) => {
      const plan = plans?.find((item) => item.id === planId);
      if (!plan) return;
      setPending(true);
      setError(null);
      try {
        if (plan.tier === "free") {
          await accountMemberships.subscribePlatform({ planId });
          await reload();
          return;
        }
        const nextPreview =
          await accountMemberships.previewPlatformSubscriptionCheckout({
            planId,
            renewalMode: "manual",
          });
        setPreview(nextPreview);
        setAttemptKey(
          `owner-platform-subscription:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        );
        setDialogOpen(true);
      } catch (cause) {
        setError(cause instanceof ApiError ? cause.message : t("previewError"));
      } finally {
        setPending(false);
      }
    },
    [plans, reload, t],
  );

  const confirmCheckout = useCallback(async () => {
    if (!preview || !attemptKey) return;
    setPending(true);
    setError(null);
    try {
      const initiation =
        await accountMemberships.initiatePlatformSubscriptionCheckout({
          planId: preview.plan.id,
          renewalMode: preview.renewalMode,
          idempotencyKey: attemptKey,
          previewFingerprint: preview.fingerprint,
          consentVersion: preview.consentVersion,
          consentAccepted: true,
          callbackUrl: getPaymentCallbackUrl("/owner/subscription"),
        });
      window.location.assign(initiation.redirectUrl);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("paymentError"));
      setPending(false);
    }
  }, [attemptKey, preview, t]);

  const formattedPreviewPrice = useMemo(() => {
    if (!preview) return "";
    const unit =
      preview.price.currency === "IRT"
        ? t("currencyIrt")
        : preview.price.currency;
    return `${new Intl.NumberFormat("fa-IR").format(preview.price.payable)} ${unit}`;
  }, [preview, t]);

  if (!plans) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="px-4 pt-3 text-center" role="alert">
          <Typography className="text-danger" type="body-sm">
            {error}
          </Typography>
          <Button
            className="mt-2"
            isDisabled={pending}
            onPress={() => void reload()}
            size="sm"
            variant="secondary"
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}
      <AthleteSubscriptionScreen
        currentPlanId={currentPlanId}
        onUpgrade={currentPlanId ? undefined : openCheckout}
        pending={pending}
        plans={plans}
        subtitle={t("subtitle")}
        title={t("title")}
      />

      <AlertDialog>
        <AlertDialog.Backdrop isOpen={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{t("confirmTitle")}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <Typography type="body">
                  {preview
                    ? t("confirmBody", {
                        plan: preview.plan.name,
                        price: formattedPreviewPrice,
                        days: preview.plan.periodDays,
                      })
                    : ""}
                </Typography>
                <Typography className="mt-3 text-foreground-500" type="body-sm">
                  {t("consent")}
                </Typography>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  isDisabled={pending}
                  onPress={() => setDialogOpen(false)}
                  variant="secondary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  isDisabled={pending || !preview}
                  onPress={() => void confirmCheckout()}
                  variant="primary"
                >
                  {pending ? t("redirecting") : t("pay")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
