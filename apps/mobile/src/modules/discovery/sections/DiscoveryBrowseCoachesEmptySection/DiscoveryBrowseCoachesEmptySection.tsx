"use client";

import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import type { DiscoveryBrowseCoachesEmptySectionProps } from "./DiscoveryBrowseCoachesEmptySection.types";

export function DiscoveryBrowseCoachesEmptySection({
  isLoading,
  coachesCount,
  onViewAll,
}: DiscoveryBrowseCoachesEmptySectionProps) {
  const t = useTranslations("DiscoveryCoaches");

  if (isLoading || coachesCount > 0) return null;

  return (
    <EmptyState
      description={t("emptyBody")}
      illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
      illustrationAlt=""
      layout="media"
      primaryAction={{
        label: t("viewAllCoaches"),
        onPress: onViewAll,
      }}
      title={t("emptyTitle")}
    />
  );
}
