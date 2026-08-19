"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ScheduleWorkoutCard } from "@repo/ui/cards/ScheduleWorkoutCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDiscoveryClubSlots } from "../../lib/use-discovery-club-slots";
import { discoveryClubsSlotsScreenStyles as styles } from "./DiscoveryClubsSlotsScreen.styles";
import type { DiscoveryClubsSlotsScreenProps } from "./DiscoveryClubsSlotsScreen.types";

const INTENSITY_LABEL_KEYS = {
  intense: "calendarIntensityIntense",
  normal: "calendarIntensityNormal",
  extreme: "calendarIntensityExtreme",
} as const;

export function DiscoveryClubsSlotsScreen({
  club,
}: DiscoveryClubsSlotsScreenProps) {
  const t = useTranslations("ClubDetail");
  const router = useRouter();
  const { slots, isLoading } = useDiscoveryClubSlots(club.id);

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("slotsPageTitle")}
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
          {t("slotsCount", { count: slots.length })}
        </Typography>

        {isLoading ? (
          <div className={styles.status}>
            <Spinner size="sm" />
            <span>{t("calendarLoading")}</span>
          </div>
        ) : null}

        {!isLoading && slots.length === 0 ? (
          <div className={styles.empty}>
            <Typography className={styles.emptyTitle} type="h4" weight="semibold">
              {t("slotsEmptyTitle")}
            </Typography>
            <Typography className={styles.emptyBody} type="body-sm">
              {t("slotsEmptyBody")}
            </Typography>
          </div>
        ) : null}

        {!isLoading && slots.length > 0 ? (
          <div className={styles.list}>
            {slots.map((item) => {
              const href = `/discovery/clubs/${club.id}/slots/${item.id}`;
              return (
                <ScheduleWorkoutCard
                  aria-label={item.title}
                  category={`${item.scheduleLabel} • ${item.category}`}
                  className={styles.card}
                  duration={item.durationLabel}
                  image={item.image || PLACEHOLDER_IMAGE}
                  imageAlt={item.title}
                  intensity={item.intensity}
                  intensityLabel={t(INTENSITY_LABEL_KEYS[item.intensity])}
                  key={item.id}
                  onPress={() => router.push(href)}
                  title={item.title}
                  trailing="chevron"
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
