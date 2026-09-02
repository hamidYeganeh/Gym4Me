"use client";

import { useTranslations } from "next-intl";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { DiscoveryCoachesDetailActionsSection } from "../../sections/DiscoveryCoachesDetailActionsSection";
import { DiscoveryCoachesDetailBodySection } from "../../sections/DiscoveryCoachesDetailBodySection";
import { DiscoveryCoachesDetailHeroSection } from "../../sections/DiscoveryCoachesDetailHeroSection";
import { discoveryCoachesDetailScreenStyles as styles } from "./DiscoveryCoachesDetailScreen.styles";
import type { DiscoveryCoachesDetailScreenProps } from "./DiscoveryCoachesDetailScreen.types";
import { useRouter } from "@/shared/lib/app-router";

export function DiscoveryCoachesDetailScreen({
  coach,
}: DiscoveryCoachesDetailScreenProps) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();
  const defaultPackageId =
    coach.packages.find((plan) => plan.price > 0)?.id ??
    coach.packages[0]?.id ??
    "";
  const selectedPackageId = defaultPackageId;

  const selectedPackage =
    coach.packages.find((plan) => plan.id === selectedPackageId) ??
    coach.packages[0];

  // API coaches have no demo packages — quote the cheapest consultation type.
  const consultationFallbackPrice =
    coach.packages.length === 0 && coach.consultationTypes.length > 0
      ? Math.min(...coach.consultationTypes.map((option) => option.price))
      : null;

  const booking = coach.bookingOptions?.[0];
  const reserveHref = booking
    ? `/athlete/booking/time?${new URLSearchParams({
        branchId: booking.branchId,
        offeringId: booking.offeringId,
        resourceId: booking.resourceId,
        duration: String(booking.durationMinutes),
        name: booking.name,
      }).toString()}`
    : `/discovery/coaches/${coach.id}/reserve`;

  const priceSuffix =
    selectedPackage?.planNameKey === "packageMonthly"
      ? t("packagePriceSuffixMonthly")
      : selectedPackage?.planNameKey === "packageTrial"
        ? ""
        : coach.priceSuffix || t("packagePriceSuffix");

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryCoachesDetailHeroSection coach={coach}>
          <DiscoveryCoachesDetailBodySection coach={coach} />
        </DiscoveryCoachesDetailHeroSection>
      </div>
      <DiscoveryCoachesDetailActionsSection
        onBook={() =>
          runWithAuth(() => router.push(reserveHref), reserveHref)
        }
        price={selectedPackage?.price ?? consultationFallbackPrice ?? 0}
        pricePrefix={
          selectedPackage || consultationFallbackPrice !== null
            ? coach.pricePrefix
            : undefined
        }
        priceSuffix={
          selectedPackage
            ? priceSuffix
            : consultationFallbackPrice !== null
              ? coach.priceSuffix || t("packagePriceSuffix")
              : undefined
        }
      />
    </div>
  );
}
