"use client";

import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ApiError, type MembershipCheckoutPreview } from "@repo/api";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { accountMemberships, isDiscoveryApiId } from "@/shared/lib/api";
import { getPaymentCallbackUrl } from "@/shared/lib/payment-return";
import { DiscoveryClubsDetailActionsSection } from "../../sections/DiscoveryClubsDetailActionsSection";
import { DiscoveryClubsDetailBodySection } from "../../sections/DiscoveryClubsDetailBodySection";
import { DiscoveryClubsDetailHeroSection } from "../../sections/DiscoveryClubsDetailHeroSection";
import { discoveryClubsDetailScreenStyles as styles } from "./DiscoveryClubsDetailScreen.styles";
import type { DiscoveryClubsDetailScreenProps } from "./DiscoveryClubsDetailScreen.types";

function getClubRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return undefined;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function DiscoveryClubsDetailScreen({
  club,
}: DiscoveryClubsDetailScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();
  const defaultPlanId =
    club.subscriptions.find((plan) => plan.price > 0)?.id ??
    club.subscriptions[0]?.id ??
    "";
  const [selectedSubscriptionId, setSelectedSubscriptionId] =
    useState(defaultPlanId);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPreview, setCheckoutPreview] =
    useState<MembershipCheckoutPreview | null>(null);
  const [checkoutAttemptKey, setCheckoutAttemptKey] = useState<string | null>(
    null,
  );

  const selectedPlan =
    club.subscriptions.find((plan) => plan.id === selectedSubscriptionId) ??
    club.subscriptions[0];
  const rating = getClubRating(club.reviews);
  const reserveHref = `/discovery/clubs/${club.id}/reserve`;
  const canPurchaseMembership =
    isDiscoveryApiId(club.id) && Boolean(selectedPlan?.id);

  const onPrimaryAction = () => {
    if (!canPurchaseMembership) {
      runWithAuth(() => router.push(reserveHref), reserveHref);
      return;
    }

    runWithAuth(() => {
      void (async () => {
        if (!selectedPlan) return;
        setPending(true);
        setActionError(null);
        try {
          if (selectedPlan.price <= 0) {
            await accountMemberships.purchase({
              clubId: club.id,
              planId: selectedPlan.id,
              idempotencyKey: `membership-free:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
            });
            router.push("/athlete/memberships");
            return;
          }
          const preview = await accountMemberships.previewCheckout({
            clubId: club.id,
            planId: selectedPlan.id,
          });
          setCheckoutPreview(preview);
          setCheckoutAttemptKey(
            `membership-purchase:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
          );
          setCheckoutOpen(true);
        } catch (error) {
          setActionError(
            error instanceof ApiError
              ? error.message
              : t("purchaseMembershipError"),
          );
        } finally {
          setPending(false);
        }
      })();
    }, `/discovery/clubs/${club.id}`);
  };

  const confirmCheckout = async () => {
    if (!selectedPlan || !checkoutPreview || !checkoutAttemptKey) return;
    setPending(true);
    setActionError(null);
    try {
      const initiation = await accountMemberships.initiateCheckout({
        clubId: club.id,
        planId: selectedPlan.id,
        idempotencyKey: checkoutAttemptKey,
        previewFingerprint: checkoutPreview.fingerprint,
        consentVersion: checkoutPreview.consentVersion,
        consentAccepted: true,
        callbackUrl: getPaymentCallbackUrl("/athlete/memberships"),
      });
      window.location.assign(initiation.redirectUrl);
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : t("purchaseMembershipError"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryClubsDetailHeroSection
          gallery={club.gallery}
          images={club.images}
          isFavorite={club.isFavorite}
          isOpen={club.isOpen}
          location={club.location}
          openHoursLabel={club.openHoursLabel}
          rating={rating}
          reviewCount={club.reviews.length}
          title={club.title}
        >
          <DiscoveryClubsDetailBodySection
            club={club}
            onSubscriptionChange={setSelectedSubscriptionId}
            selectedSubscriptionId={selectedSubscriptionId}
          />
        </DiscoveryClubsDetailHeroSection>
        {actionError ? (
          <div className="px-4 pb-3 text-center">
            <Typography className="text-danger" type="body-sm">
              {actionError}
            </Typography>
          </div>
        ) : null}
      </div>
      <DiscoveryClubsDetailActionsSection
        ctaLabel={
          canPurchaseMembership
            ? t("purchaseMembership")
            : t("confirmBooking")
        }
        onReserve={onPrimaryAction}
        pending={pending}
        price={selectedPlan?.price ?? 0}
        pricePrefix={club.pricePrefix}
        priceSuffix={club.priceSuffix}
      />
      <AlertDialog>
        <AlertDialog.Backdrop isOpen={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {t("purchaseMembershipConfirmTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                {checkoutPreview ? (
                  <div className="space-y-3">
                    <Typography type="body-sm">
                      {t("purchaseMembershipConfirmPlan", {
                        plan: checkoutPreview.plan.name,
                      })}
                    </Typography>
                    <Typography type="body" weight="semibold">
                      {t("purchaseMembershipConfirmPrice", {
                        amount: new Intl.NumberFormat("fa-IR").format(
                          checkoutPreview.price.payable,
                        ),
                        currency:
                          checkoutPreview.price.currency === "IRT"
                            ? t("currencyIrt")
                            : checkoutPreview.price.currency,
                      })}
                    </Typography>
                    <Typography className="text-muted" type="body-sm">
                      {t("purchaseMembershipConsent")}
                    </Typography>
                  </div>
                ) : null}
                {actionError ? (
                  <Typography className="text-danger" type="body-sm">
                    {actionError}
                  </Typography>
                ) : null}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {t("purchaseMembershipCancel")}
                </Button>
                <Button
                  isDisabled={!checkoutPreview}
                  isPending={pending}
                  onPress={() => {
                    void confirmCheckout();
                  }}
                  variant="primary"
                >
                  {t("purchaseMembershipPay")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
