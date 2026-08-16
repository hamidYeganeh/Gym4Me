"use client";

import { Spinner, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { DiscoverySportsDetailScreen } from "../screens/DiscoverySportsDetailScreen";
import { useDiscoverySportDetail } from "./use-discovery-sport-detail";

type Props = {
  sportId: string;
};

/** Client gate for `/discovery/sports/:sportId`. */
export function DiscoverySportDetailGate({ sportId }: Props) {
  const t = useTranslations("DiscoverySportDetail");
  const { sport, isLoading } = useDiscoverySportDetail(sportId);

  if (isLoading && !sport) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sport) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          {t("notFound")}
        </Typography>
      </div>
    );
  }

  return <DiscoverySportsDetailScreen sport={sport} />;
}
