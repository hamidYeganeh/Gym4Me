"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
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
          {t("classesPageTitle")}
        </Typography>
      </header>

      {club.classes.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          {t("notFound")}
        </Typography>
      ) : (
        <div className={styles.list}>
          {club.classes.map((item) => {
            const href = `/discovery/clubs/${club.id}/classes/${item.id}`;
            return (
              <div
                className="cursor-pointer"
                key={item.id}
                onClick={() => router.push(href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(href);
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <ClubClassCard
                  actionLabel={t("classAction")}
                  author={item.author}
                  backgroundImage={item.backgroundImage}
                  category={item.category}
                  date={item.date}
                  duration={item.duration}
                  onAction={() => router.push(href)}
                  size="md"
                  title={item.title}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
