"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { SportCard } from "@repo/ui/cards/SportCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
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
    <AppLayout
      className={styles.root}
      header={
        <Header
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
