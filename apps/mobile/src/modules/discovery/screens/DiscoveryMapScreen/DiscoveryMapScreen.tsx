"use client";

import { Button } from "@heroui/react/button";
import { Skeleton } from "@heroui/react/skeleton";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useMemo, useState } from "react";
import { DiscoveryMapCanvasSection } from "../../sections/DiscoveryMapCanvasSection";
import { DiscoveryMapCoachSection } from "../../sections/DiscoveryMapCoachSection";
import { discoveryMapScreenStyles as styles } from "./DiscoveryMapScreen.styles";
import type { DiscoveryMapScreenProps } from "./DiscoveryMapScreen.types";

export function DiscoveryMapScreen({
  coaches,
  initialSelectedId,
  isError,
  isLoading,
  nearestId,
  onRetry,
}: DiscoveryMapScreenProps) {
  const t = useTranslations("DiscoveryMap");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  const markers = useMemo(
    () =>
      coaches.map((coach) => ({
        id: coach.id,
        lat: coach.lat,
        lng: coach.lng,
        image: coach.image,
        distanceLabel: coach.distanceLabel,
      })),
    [coaches],
  );

  const selectedCoach =
    coaches.find((coach) => coach.id === selectedId) ?? coaches[0];

  function openDirections() {
    if (!selectedCoach) return;
    const { lat, lng } = selectedCoach;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
          endContent={
            <Button
              aria-label={t("search")}
              isIconOnly
              size="lg"
              variant="ghost"
            >
              <MagnifyingGlass className="text-foreground" size={22} />
            </Button>
          }
          className={styles.header}
        />
      }
    >
      <div className={styles.stage}>
        {isLoading ? (
          <div
            aria-label={t("loading")}
            aria-live="polite"
            className={styles.loading}
            role="status"
          >
            <Skeleton aria-hidden className="size-full rounded-none" />
          </div>
        ) : isError ? (
          <div className={styles.state}>
            <EmptyState
              description={t("errorBody")}
              illustration={EMPTY_STATE_ILLUSTRATIONS.warning}
              illustrationAlt=""
              primaryAction={{ label: t("retry"), onPress: onRetry }}
              status="danger"
              title={t("errorTitle")}
            />
          </div>
        ) : coaches.length === 0 ? (
          <div className={styles.state}>
            <EmptyState
              description={t("emptyBody")}
              illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
              illustrationAlt=""
              title={t("emptyTitle")}
            />
          </div>
        ) : (
          <DiscoveryMapCanvasSection
            markers={markers}
            nearestId={nearestId}
            onSelect={setSelectedId}
            selectedId={selectedId}
            zoomInLabel={t("zoomIn")}
            zoomLabel={t("zoom")}
            zoomOutLabel={t("zoomOut")}
          />
        )}

        {!isLoading && !isError && selectedCoach ? (
          <DiscoveryMapCoachSection
            coach={selectedCoach}
            getDirectionsLabel={t("getDirections")}
            onGetDirections={openDirections}
            onViewDetails={() =>
              router.push(
                selectedCoach.detailsHref ??
                  `/discovery/coaches/${selectedCoach.id}`,
              )
            }
            verifiedLabel={t("verified")}
            viewDetailsLabel={t("viewDetails")}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
