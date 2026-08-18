"use client";

import type { ComponentType } from "react";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { DiscoveryCoachesDetailScreen } from "../screens/DiscoveryCoachesDetailScreen";
import { DiscoveryCoachesReserveScreen } from "../screens/DiscoveryCoachesReserveScreen";
import { DiscoveryCoachesReviewsScreen } from "../screens/DiscoveryCoachesReviewsScreen";
import { DiscoveryCoachesSlotsScreen } from "../screens/DiscoveryCoachesSlotsScreen";
import type { CoachDetail } from "./coach-detail-data";
import { useDiscoveryCoachDetail } from "./use-discovery-coach-detail";

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
export function DiscoveryCoachDetailGate({
  coachId,
  view = "detail",
}: Props) {
  const t = useTranslations("CoachDetail");
  const { coach, isLoading } = useDiscoveryCoachDetail(coachId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
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

  const Screen = COACH_VIEWS[view];
  return <Screen coach={coach} />;
}
