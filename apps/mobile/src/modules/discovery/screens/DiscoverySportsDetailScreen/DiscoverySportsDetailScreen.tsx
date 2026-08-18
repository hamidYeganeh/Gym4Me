"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { SportCard } from "@repo/ui/cards/SportCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoverySportsDetailScreenStyles as styles } from "./DiscoverySportsDetailScreen.styles";
import type { DiscoverySportsDetailScreenProps } from "./DiscoverySportsDetailScreen.types";

export function DiscoverySportsDetailScreen({
  sport,
}: DiscoverySportsDetailScreenProps) {
  const t = useTranslations("DiscoverySportDetail");
  const router = useRouter();

  const clubsHref = sport.clubSportKey
    ? `/discovery/clubs?sportId=${encodeURIComponent(sport.clubSportKey)}`
    : `/discovery/clubs?sportId=${encodeURIComponent(sport.id)}`;

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
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {sport.name}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {sport.description ?? t("subtitleFallback")}
          </Typography>
        </section>

        <SportCard
          actionLabel={t("browseClubs")}
          className={styles.heroCard}
          color={sport.color}
          size="md"
          sport={{
            title: sport.name,
            subtitle: sport.description ?? t("sportLabel"),
            backgroundImage: sport.image,
          }}
          onPress={() => router.push(clubsHref)}
        />

        <section className={styles.section}>
          <div>
            <Typography className={styles.sectionTitle} type="h4" weight="bold">
              {t("clubsTitle")}
            </Typography>
            <Typography className={styles.sectionHint} type="body-xs">
              {t("clubsHint")}
            </Typography>
          </div>

          {sport.clubs.length === 0 ? (
            <div className={styles.empty}>
              <Typography className={styles.emptyTitle} type="h4" weight="semibold">
                {t("emptyTitle")}
              </Typography>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyBody")}
              </Typography>
            </div>
          ) : (
            <div className={styles.stack}>
              {sport.clubs.map((club) => (
                <ClubCard
                  actionLabel={t("viewClub")}
                  className={styles.clubCard}
                  favoriteLabel={t("favoriteLabel")}
                  features={club.featureLabels.map((label) => ({ label }))}
                  image={club.image || PLACEHOLDER_IMAGE}
                  imageAlt={club.title}
                  key={club.id}
                  onAction={() => router.push(`/discovery/clubs/${club.id}`)}
                  orientation="horizontal"
                  price={club.price}
                  pricePrefix={t("pricePrefix")}
                  priceSuffix={t("priceSuffix")}
                  rating={club.rating}
                  ratingCount={club.ratingCount}
                  shareLabel={t("shareLabel")}
                  subtitle={club.location}
                  title={club.title}
                />
              ))}
            </div>
          )}
        </section>

        <Button
          className="self-start"
          variant="secondary"
          onPress={() => router.push(clubsHref)}
        >
          {t("browseClubs")}
        </Button>
      </div>
    </AppLayout>
  );
}
