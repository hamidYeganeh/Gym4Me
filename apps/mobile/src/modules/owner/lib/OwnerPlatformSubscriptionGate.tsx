"use client";

import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import {
  ApiError,
  type PlatformEntitlementSummary,
  type PlatformSubscription,
  type PlatformSubscriptionCheckoutPreview,
} from "@repo/api";
import type { Key } from "@react-types/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AthleteSubscriptionScreen } from "@/modules/athlete/screens/AthleteSubscriptionScreen";
import type { SubscriptionPlan } from "@/modules/athlete/lib/athlete-subscription-data";
import { accountMemberships, clubOwnerClubs } from "@/shared/lib/api";
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
  const [currentSubscription, setCurrentSubscription] =
    useState<PlatformSubscription | null>(null);
  const [entitlements, setEntitlements] =
    useState<PlatformEntitlementSummary | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] =
    useState<PlatformSubscriptionCheckoutPreview | null>(null);
  const [attemptKey, setAttemptKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] =
    useState<{ id: string; name: string } | null>(null);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClubId, setSelectedClubId] = useState("");

  const reload = useCallback(async () => {
    const [catalog, subscriptions, ownedClubs] = await Promise.all([
      accountMemberships.listPlatformPlans(),
      accountMemberships.listPlatformSubscriptions(),
      clubOwnerClubs.list({ page_size: 100 }),
    ]);
    const clubOptions = ownedClubs.result.map((club) => ({
      id: club.id,
      name: club.identity.name,
    }));
    const scopedClubId =
      clubOptions.find((club) => club.id === selectedClubId)?.id ??
      clubOptions[0]?.id ??
      "";
    const entitlementSummary =
      await accountMemberships.getPlatformEntitlements(
        scopedClubId || undefined,
      );
    const current = subscriptions.result.find(
      (subscription) =>
        subscription.status === "active" ||
        subscription.status === "trialing" ||
        subscription.status === "past_due",
    );
    const currentAmount =
      catalog.result.find((plan) => plan.id === current?.planId)?.pricing.amount ??
      null;
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
        amount: plan.pricing.amount,
        actionLabel:
          currentAmount !== null && plan.pricing.amount < currentAmount
            ? t("scheduleDowngrade")
            : t("upgrade"),
      })),
    );
    setCurrentSubscription(current ?? null);
    setClubs(clubOptions);
    setSelectedClubId(scopedClubId);
    setEntitlements(entitlementSummary);
    setCurrentPlanId(current?.planId ?? "");
  }, [selectedClubId, t]);

  const changeClub = useCallback(
    async (value: Key | Key[] | null) => {
      const clubId = String(value ?? "");
      if (!clubId || clubId === selectedClubId) return;
      setSelectedClubId(clubId);
      setPending(true);
      setError(null);
      try {
        setEntitlements(
          await accountMemberships.getPlatformEntitlements(clubId),
        );
      } catch (cause) {
        setError(cause instanceof ApiError ? cause.message : t("loadError"));
      } finally {
        setPending(false);
      }
    },
    [selectedClubId, t],
  );

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
        const currentPlan = plans?.find(
          (item) => item.id === currentSubscription?.planId,
        );
        if (
          currentSubscription &&
          currentPlan?.amount !== undefined &&
          plan.amount !== undefined &&
          plan.amount < currentPlan.amount
        ) {
          setScheduleTarget({ id: plan.id, name: plan.name });
          setPreview(null);
          setDialogOpen(true);
          return;
        }
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
    [currentSubscription, plans, reload, t],
  );

  const confirmCheckout = useCallback(async () => {
    if (scheduleTarget && currentSubscription) {
      setPending(true);
      setError(null);
      try {
        await accountMemberships.schedulePlatformPlanChange(
          currentSubscription.id,
          { planId: scheduleTarget.id },
        );
        setDialogOpen(false);
        setScheduleTarget(null);
        await reload();
      } catch (cause) {
        setError(cause instanceof ApiError ? cause.message : t("scheduleError"));
      } finally {
        setPending(false);
      }
      return;
    }
    if (!preview || !attemptKey) return;
    setPending(true);
    setError(null);
    try {
      const initiation =
        await accountMemberships.initiatePlatformSubscriptionCheckout({
          planId: preview.plan.id,
          renewalMode: preview.renewalMode,
          priceReferenceAt: preview.priceReferenceAt,
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
  }, [attemptKey, currentSubscription, preview, reload, scheduleTarget, t]);

  const formattedPreviewPrice = useMemo(() => {
    if (!preview) return "";
    const unit =
      preview.price.currency === "IRT"
        ? t("currencyIrt")
        : preview.price.currency;
    return `${new Intl.NumberFormat("fa-IR").format(preview.price.payable)} ${unit}`;
  }, [preview, t]);

  const formatDate = useCallback(
    (value: string) =>
      new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        dateStyle: "medium",
        timeZone: "Asia/Tehran",
      }).format(new Date(value)),
    [],
  );

  const confirmCancellation = useCallback(async () => {
    if (!currentSubscription) return;
    setPending(true);
    setError(null);
    try {
      await accountMemberships.cancelPlatformSubscription(
        currentSubscription.id,
        { reason: "owner_requested" },
      );
      setCancelDialogOpen(false);
      await reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("cancelError"));
    } finally {
      setPending(false);
    }
  }, [currentSubscription, reload, t]);

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
      {entitlements ? (
        <section className="mx-4 mt-3 rounded-xl border border-default-200 bg-content1 p-4">
          <Typography type="body" weight="semibold">
            {t("usageTitle")}
          </Typography>
          <Typography className="mt-1 text-foreground-500" type="body-sm">
            {t(`state.${entitlements.state}`)}
          </Typography>
          {entitlements.period ? (
            <Typography className="mt-1 text-foreground-500" type="body-sm">
              {t("periodEnd", { date: formatDate(entitlements.period.end) })}
            </Typography>
          ) : null}
          {entitlements.graceEndsAt ? (
            <Typography className="mt-1 text-warning" type="body-sm">
              {t("graceEnd", { date: formatDate(entitlements.graceEndsAt) })}
            </Typography>
          ) : null}
          {entitlements.scheduledPlanEffectiveAt ? (
            <Typography className="mt-1 text-foreground-500" type="body-sm">
              {t("scheduledChange", {
                date: formatDate(entitlements.scheduledPlanEffectiveAt),
              })}
            </Typography>
          ) : null}
          {entitlements.cancellationRequestedAt ? (
            <Typography className="mt-1 text-foreground-500" type="body-sm">
              {t("cancellationScheduled", {
                date: formatDate(entitlements.cancellationRequestedAt),
              })}
            </Typography>
          ) : null}
          {clubs.length > 0 ? (
            <Select
              className="mt-3"
              value={selectedClubId}
              onChange={(value) => void changeClub(value)}
            >
              <Label>{t("clubScope")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {clubs.map((club) => (
                    <ListBox.Item
                      id={club.id}
                      key={club.id}
                      textValue={club.name}
                    >
                      {club.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          ) : null}
          {entitlements.limits.map((limit) => (
            <div className="mt-2 flex items-center justify-between gap-3" key={limit.key}>
              <Typography type="body-sm">
                {t(`limit.${limit.key}`)}: {limit.usage === null ? t("usageScoped") : new Intl.NumberFormat("fa-IR").format(limit.usage)} / {limit.value === null ? t("unlimited") : new Intl.NumberFormat("fa-IR").format(limit.value)}
              </Typography>
              <Typography
                className={
                  limit.allowed && limit.reasonCode !== "soft_limit_exceeded"
                    ? "text-success"
                    : limit.reasonCode === "soft_limit_exceeded"
                      ? "text-warning"
                      : "text-danger"
                }
                type="body-sm"
                weight="semibold"
              >
                {limit.reasonCode === "soft_limit_exceeded"
                  ? t("softLimitExceeded")
                  : limit.allowed
                    ? t("allowed")
                    : t("limitReached")}
              </Typography>
            </div>
          ))}
          {entitlements.upgradePlanIds.length > 0 ? (
            <Typography className="mt-3 text-warning" type="body-sm">
              {t("upgradeAvailable")}
            </Typography>
          ) : null}
          {currentSubscription &&
          !entitlements.cancellationRequestedAt &&
          (currentSubscription.status === "active" ||
            currentSubscription.status === "trialing" ||
            currentSubscription.status === "past_due") ? (
            <Button
              className="mt-4"
              isDisabled={pending}
              onPress={() => setCancelDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              {t("cancelSubscription")}
            </Button>
          ) : null}
        </section>
      ) : null}
      <AthleteSubscriptionScreen
        currentPlanId={currentPlanId}
        onUpgrade={openCheckout}
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
                  {scheduleTarget
                    ? t("scheduleBody", { plan: scheduleTarget.name })
                    : preview
                    ? t("confirmBody", {
                        plan: preview.plan.name,
                        price: formattedPreviewPrice,
                        days: preview.plan.periodDays,
                      })
                    : ""}
                </Typography>
                {preview ? (
                  <Typography className="mt-3 text-foreground-500" type="body-sm">
                    {t("consent")}
                  </Typography>
                ) : null}
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
                  isDisabled={pending || (!preview && !scheduleTarget)}
                  onPress={() => void confirmCheckout()}
                  variant="primary"
                >
                  {pending
                    ? t("processing")
                    : scheduleTarget
                      ? t("confirmSchedule")
                      : t("pay")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      <AlertDialog>
        <AlertDialog.Backdrop
          isOpen={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {t("cancelSubscriptionTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <Typography type="body">
                  {t("cancelSubscriptionBody")}
                </Typography>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  isDisabled={pending}
                  onPress={() => setCancelDialogOpen(false)}
                  variant="secondary"
                >
                  {t("keepSubscription")}
                </Button>
                <Button
                  isDisabled={pending}
                  onPress={() => void confirmCancellation()}
                  variant="danger"
                >
                  {pending ? t("processing") : t("confirmCancellation")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
