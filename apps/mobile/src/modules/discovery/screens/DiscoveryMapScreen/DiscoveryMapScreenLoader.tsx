"use client";

import { Skeleton } from "@heroui/react/skeleton";
import { CoachMapCardSkeleton } from "@repo/ui/cards/CoachMapCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useDiscoveryMapPins } from "../../lib/use-discovery-map-pins";
import { DiscoveryMapScreen } from "./DiscoveryMapScreen";
import { discoveryMapScreenStyles as styles } from "./DiscoveryMapScreen.styles";

function DiscoveryMapPageSkeleton() {
  const t = useTranslations("DiscoveryMap");

  return (
    <AppLayout className={styles.root} header={<Header title={t("title")} />}>
      <div
        aria-busy="true"
        aria-live="polite"
        className={styles.stage}
        role="status"
      >
        <Skeleton aria-hidden className="absolute inset-0 rounded-none" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-screen pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <CoachMapCardSkeleton className="pointer-events-auto" />
        </div>
      </div>
    </AppLayout>
  );
}

export function DiscoveryMapScreenLoader() {
  const map = useDiscoveryMapPins();

  if (map.isLoading) {
    return <DiscoveryMapPageSkeleton />;
  }

  return (
    <DiscoveryMapScreen
      coaches={map.coaches}
      initialSelectedId={map.initialSelectedId}
      nearestId={map.nearestId}
    />
  );
}
