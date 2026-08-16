"use client";

import { Spinner, Typography } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DiscoveryClubsClassDetailScreen } from "../screens/DiscoveryClubsClassDetailScreen";
import { useDiscoveryClassDetailById } from "./use-discovery-class-detail-by-id";

type Props = {
  classId: string;
};

/** Client gate for global `/discovery/classes/:classId` (optional `?clubId=`). */
export function DiscoveryClassByIdGate({ classId }: Props) {
  const t = useTranslations("ClubClassDetail");
  const searchParams = useSearchParams();
  const clubIdHint = searchParams.get("clubId") ?? undefined;
  const { classDetail, isLoading } = useDiscoveryClassDetailById(
    classId,
    clubIdHint,
  );

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
