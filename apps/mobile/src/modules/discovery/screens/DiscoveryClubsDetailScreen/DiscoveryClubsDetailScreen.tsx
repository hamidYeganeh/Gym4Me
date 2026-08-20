"use client";

import { Typography } from "@heroui/react/typography";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useState } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { accountFinance, accountMemberships, isDiscoveryApiId } from "@/shared/lib/api";
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
          const membership = await accountMemberships.purchase({
            clubId: club.id,
            planId: selectedPlan.id,
            idempotencyKey: `membership-purchase:${club.id}:${selectedPlan.id}:${Date.now()}`,
          });
          if (membership.paymentId) {
            try {
              const invoice = await accountFinance.issueInvoiceFromPayment({
                paymentId: membership.paymentId,
              });
              router.push(
                `/athlete/payment/${invoice.id}?status=success&source=membership`,
              );
              return;
            } catch {
              // Invoice is optional; membership itself is the success signal.
            }
          }
          router.push("/athlete/memberships");
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
    </div>
  );
}
