"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
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
  const { classDetail, isLoading } = useDiscoveryClassDetail(clubId, classId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
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
