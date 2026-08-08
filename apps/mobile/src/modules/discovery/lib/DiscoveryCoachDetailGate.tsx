"use client";

import { Spinner, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { DiscoveryCoachesDetailScreen } from "../screens/DiscoveryCoachesDetailScreen";
import { useDiscoveryCoachDetail } from "./use-discovery-coach-detail";

type Props = {
  coachId: string;
};

/** Client gate: server pages pass only the id (render props are not RSC-serializable). */
export function DiscoveryCoachDetailGate({ coachId }: Props) {
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

  return <DiscoveryCoachesDetailScreen coach={coach} />;
}
