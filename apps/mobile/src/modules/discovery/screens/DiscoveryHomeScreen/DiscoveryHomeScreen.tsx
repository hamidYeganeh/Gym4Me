"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";

import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeHeaderSection } from "../../sections/DiscoveryHomeHeaderSection";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";
import type { DiscoveryHomeScreenProps } from "./DiscoveryHomeScreen.types";

export function DiscoveryHomeScreen({
  banners = [],
}: DiscoveryHomeScreenProps) {
  const t = useTranslations("DiscoveryHome");

  return (
    <AppLayout
      className={styles.root}
      header={
        <DiscoveryHomeHeaderSection locationLabel={t("locationFallback")} />
      }
    >
      <div className={styles.content}>
        <DiscoveryHomeBannersSection banners={banners} />
      </div>
    </AppLayout>
  );
}
