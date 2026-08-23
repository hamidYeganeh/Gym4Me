"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { DiscoveryClubsClassDetailScreen } from "../screens/DiscoveryClubsClassDetailScreen";
import { useDiscoveryClassDetail } from "./use-discovery-class-detail";

type Props = {
  clubId: string;
  classId: string;
};

/** Client gate: server pages pass only ids (render props are not RSC-serializable). */
export function DiscoveryClassDetailGate({ clubId, classId }: Props) {
  const t = useTranslations("ClubClassDetail");
  const { classDetail, isLoading, isError, retry } = useDiscoveryClassDetail(
    clubId,
    classId,
  );

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

  if (!classDetail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  return <DiscoveryClubsClassDetailScreen classDetail={classDetail} />;
}
