"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { SportCard } from "@repo/ui/cards/SportCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryClubsSportsScreenStyles as styles } from "./DiscoveryClubsSportsScreen.styles";
import type { DiscoveryClubsSportsScreenProps } from "./DiscoveryClubsSportsScreen.types";

export function DiscoveryClubsSportsScreen({
  club,
}: DiscoveryClubsSportsScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("sportsPageTitle")}
        />
      }
    >
      {club.sports.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          {t("notFound")}
        </Typography>
      ) : (
        <div className={styles.list}>
          {club.sports.map((sport) => (
            <SportCard
              actionLabel={t("sportAction")}
              color={sport.color}
              key={sport.id}
              size="md"
              sport={{
                title: sport.title,
                subtitle: sport.subtitle,
                backgroundImage: sport.backgroundImage,
              }}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
