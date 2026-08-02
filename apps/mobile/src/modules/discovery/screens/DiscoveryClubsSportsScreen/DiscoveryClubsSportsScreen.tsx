"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { SportCard } from "@repo/ui/cards/SportCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryClubsSportsScreenStyles as styles } from "./DiscoveryClubsSportsScreen.styles";
import type { DiscoveryClubsSportsScreenProps } from "./DiscoveryClubsSportsScreen.types";

export function DiscoveryClubsSportsScreen({
  club,
}: DiscoveryClubsSportsScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Button
          aria-label={t("back")}
          isIconOnly
          onPress={() => router.back()}
          size="lg"
          variant="secondary"
        >
          <ChevronLeft size={20} />
        </Button>
        <Typography className={styles.title} type="h4" weight="semibold">
          {t("sportsPageTitle")}
        </Typography>
      </header>

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
    </div>
  );
}
