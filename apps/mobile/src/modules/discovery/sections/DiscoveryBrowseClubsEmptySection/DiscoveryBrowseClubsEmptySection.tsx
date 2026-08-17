"use client";

import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import type { DiscoveryBrowseClubsEmptySectionProps } from "./DiscoveryBrowseClubsEmptySection.types";

export function DiscoveryBrowseClubsEmptySection({
  isLoading,
  clubsCount,
  onViewAll,
}: DiscoveryBrowseClubsEmptySectionProps) {
  const t = useTranslations("DiscoveryClubs");

  if (isLoading || clubsCount > 0) return null;

  return (
    <EmptyState
      description={t("emptyBody")}
      illustration={EMPTY_STATE_ILLUSTRATIONS.search}
      illustrationAlt=""
      layout="media"
      primaryAction={{
        label: t("viewAllClubs"),
        onPress: onViewAll,
      }}
      title={t("emptyTitle")}
    />
  );
}
