"use client";

import { Button } from "@heroui/react/button";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
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
  nearestId,
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
        <DiscoveryMapCanvasSection
          markers={markers}
          nearestId={nearestId}
          onSelect={setSelectedId}
          selectedId={selectedId}
          zoomInLabel={t("zoomIn")}
          zoomLabel={t("zoom")}
          zoomOutLabel={t("zoomOut")}
        />

        {selectedCoach ? (
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
