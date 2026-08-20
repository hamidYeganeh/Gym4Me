"use client";

import { Typography } from "@heroui/react/typography";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryClubsClassesScreenStyles as styles } from "./DiscoveryClubsClassesScreen.styles";
import type { DiscoveryClubsClassesScreenProps } from "./DiscoveryClubsClassesScreen.types";

export function DiscoveryClubsClassesScreen({
  club,
}: DiscoveryClubsClassesScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("classesPageTitle")}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introSubtitle} type="body">
            {club.title}
          </Typography>
        </section>

        <Typography className={styles.meta} type="body-sm">
          {t("classesCount", { count: club.classes.length })}
        </Typography>

        {club.classes.length === 0 ? (
          <div className={styles.empty}>
            <Typography className={styles.emptyTitle} type="h4" weight="semibold">
              {t("classesEmptyTitle")}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t("classesEmptyBody")}
            </Typography>
          </div>
        ) : (
          <div className={styles.list}>
            {club.classes.map((item) => {
              const href = `/discovery/clubs/${club.id}/classes/${item.id}`;
              return (
                <ClubClassCard
                  actionLabel={t("classAction")}
                  author={item.author}
                  backgroundImage={item.backgroundImage}
                  backgroundImageAlt={item.title}
                  category={item.category}
                  className={styles.card}
                  date={item.date}
                  duration={item.duration}
                  key={item.id}
                  onAction={() => router.push(href)}
                  size="md"
                  title={item.title}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
