"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DiscoveryMapCanvasSection } from "../../sections/DiscoveryMapCanvasSection";
import { DiscoveryMapCoachSection } from "../../sections/DiscoveryMapCoachSection";
import { discoveryMapScreenStyles as styles } from "./DiscoveryMapScreen.styles";
import type { DiscoveryMapScreenProps } from "./DiscoveryMapScreen.types";

export function DiscoveryMapScreen({
  coaches,
  initialSelectedId,
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
        <Header
          className={styles.header}
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
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.stage}>
        <DiscoveryMapCanvasSection
          markers={markers}
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
            onViewDetails={() => router.push("/discovery/coaches")}
            viewDetailsLabel={t("viewDetails")}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
