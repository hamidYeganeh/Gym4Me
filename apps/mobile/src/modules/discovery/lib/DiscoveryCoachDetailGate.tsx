"use client";

import type { ComponentType } from "react";
import { useEffect } from "react";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { DiscoveryCoachesDetailScreen } from "../screens/DiscoveryCoachesDetailScreen";
import { DiscoveryCoachesReserveScreen } from "../screens/DiscoveryCoachesReserveScreen";
import { DiscoveryCoachesReviewsScreen } from "../screens/DiscoveryCoachesReviewsScreen";
import { DiscoveryCoachesSlotsScreen } from "../screens/DiscoveryCoachesSlotsScreen";
import type { CoachDetail } from "./coach-detail-data";
import { useDiscoveryCoachDetail } from "./use-discovery-coach-detail";
import { useRouter } from "@/shared/lib/app-router";

const COACH_VIEWS = {
  detail: DiscoveryCoachesDetailScreen,
  slots: DiscoveryCoachesSlotsScreen,
  reviews: DiscoveryCoachesReviewsScreen,
  reserve: DiscoveryCoachesReserveScreen,
} satisfies Record<string, ComponentType<{ coach: CoachDetail }>>;

export type DiscoveryCoachView = keyof typeof COACH_VIEWS;

type Props = {
  coachId: string;
  view?: DiscoveryCoachView;
};

/** Client gate: server pages pass only the id (render props are not RSC-serializable). */
export function DiscoveryCoachDetailGate({ coachId, view = "detail" }: Props) {
  const t = useTranslations("CoachDetail");
  const router = useRouter();
  const { coach, isLoading, isError, retry } = useDiscoveryCoachDetail(coachId);
  const booking = coach?.bookingOptions?.[0];
  const usesCurrentCheckout = Boolean(booking && (view === "reserve" || view === "slots"));

  useEffect(() => {
    if (!booking || !usesCurrentCheckout) return;
    const params = new URLSearchParams({
      branchId: booking.branchId,
      offeringId: booking.offeringId,
      resourceId: booking.resourceId,
      duration: String(booking.durationMinutes),
      name: booking.name,
    });
    router.replace(`/athlete/booking/time?${params.toString()}`);
  }, [booking, router, usesCurrentCheckout]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <EmptyState
          description={t("loadErrorBody")}
          illustration={EMPTY_STATE_ILLUSTRATIONS.warning}
          illustrationAlt=""
          layout="media"
          primaryAction={{ label: t("retry"), onPress: retry }}
          status="danger"
          title={t("loadErrorTitle")}
        />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  if (usesCurrentCheckout) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const Screen = COACH_VIEWS[view];
  return <Screen coach={coach} />;
}
