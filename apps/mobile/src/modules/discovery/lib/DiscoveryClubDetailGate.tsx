"use client";

import type { ComponentType } from "react";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { DiscoveryClubsBranchesScreen } from "../screens/DiscoveryClubsBranchesScreen";
import { DiscoveryClubsClassesScreen } from "../screens/DiscoveryClubsClassesScreen";
import { DiscoveryClubsDetailScreen } from "../screens/DiscoveryClubsDetailScreen";
import { DiscoveryClubsReviewsScreen } from "../screens/DiscoveryClubsReviewsScreen";
import { DiscoveryClubsSlotsScreen } from "../screens/DiscoveryClubsSlotsScreen";
import { DiscoveryClubsSportsScreen } from "../screens/DiscoveryClubsSportsScreen";
import { useDiscoveryClubDetail } from "./use-discovery-club-detail";
import type { ClubDetail } from "./club-detail-data";

/**
 * Server pages cannot pass render-prop functions to client components,
 * so the gate maps a serializable `view` key to the matching screen.
 */
const CLUB_VIEWS = {
  detail: DiscoveryClubsDetailScreen,
  branches: DiscoveryClubsBranchesScreen,
  sports: DiscoveryClubsSportsScreen,
  reviews: DiscoveryClubsReviewsScreen,
  classes: DiscoveryClubsClassesScreen,
  slots: DiscoveryClubsSlotsScreen,
} satisfies Record<string, ComponentType<{ club: ClubDetail }>>;

export type DiscoveryClubView = keyof typeof CLUB_VIEWS;

type Props = {
  clubId: string;
  view: DiscoveryClubView;
};

export function DiscoveryClubDetailGate({ clubId, view }: Props) {
  const t = useTranslations("ClubDetail");
  const { club, isLoading, isError, retry } = useDiscoveryClubDetail(clubId);

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

  if (!club) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  const Screen = CLUB_VIEWS[view];
  return <Screen club={club} />;
}
