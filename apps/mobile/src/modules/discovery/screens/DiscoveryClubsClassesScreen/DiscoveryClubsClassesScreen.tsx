"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        <Header
          className="border-b-0 bg-background"
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
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("classesPageTitle")}
          </Typography>
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
