"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ArrowRepeatClockwise1 } from "@repo/icons/ArrowRepeatClockwise1";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { Stopwatch } from "@repo/icons/Stopwatch";
import { User } from "@repo/icons/User";
import { UsersThree } from "@repo/icons/UsersThree";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { StickyBottomActions } from "@repo/ui/kit/StickyBottomActions";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useRequireAuthAction } from "@/shared/hooks/useRequireAuthAction";
import { discoveryClubsSlotDetailScreenStyles as styles } from "./DiscoveryClubsSlotDetailScreen.styles";
import type { DiscoveryClubsSlotDetailScreenProps } from "./DiscoveryClubsSlotDetailScreen.types";

const META_ICON_SIZE = 16;
const UPCOMING_ICON_SIZE = 18;

function MetaCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.metaCell}>
      <div className={styles.metaHeader}>
        <span aria-hidden className={styles.metaIcon}>
          {icon}
        </span>
        <Typography className={styles.metaLabel} type="body-xs">
          {label}
        </Typography>
      </div>
      <Typography className={styles.metaValue} type="body-sm">
        {value}
      </Typography>
    </div>
  );
}

export function DiscoveryClubsSlotDetailScreen({
  slotDetail,
}: DiscoveryClubsSlotDetailScreenProps) {
  const t = useTranslations("ClubSlotDetail");
  const tClub = useTranslations("ClubDetail");
  const router = useRouter();
  const { runWithAuth } = useRequireAuthAction();

  const reserveHref = `/discovery/clubs/${slotDetail.clubId}/reserve`;

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <Header
          className="absolute inset-x-0 top-0 z-20"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="secondary"
            >
              <ChevronLeft size={20} />
            </Button>
          }
        />

        <div className={styles.hero}>
          <Image
            alt={slotDetail.title}
            className={styles.heroImage}
            fill
            priority
            sizes="100vw"
            src={slotDetail.image}
          />
          <div aria-hidden className={styles.heroScrim} />
        </div>

        <div className={styles.sheet}>
          <div className={styles.titleBlock}>
            <Typography className={styles.category} type="body-sm">
              {slotDetail.category}
            </Typography>
            <Typography className={styles.title} type="h1" weight="bold">
              {slotDetail.title}
            </Typography>
            <Typography className={styles.clubTitle} type="body-sm">
              {slotDetail.clubTitle}
            </Typography>
            <Chip size="sm" variant="secondary">
              <Chip.Label>{tClub(slotDetail.intensityLabelKey)}</Chip.Label>
            </Chip>
          </div>

          <div className={styles.metaGrid}>
            <MetaCell
              icon={<Clock size={META_ICON_SIZE} />}
              label={t("time")}
              value={slotDetail.timeLabel}
            />
            <MetaCell
              icon={<Stopwatch size={META_ICON_SIZE} />}
              label={t("duration")}
              value={slotDetail.durationLabel}
            />
            <MetaCell
              icon={<ArrowRepeatClockwise1 size={META_ICON_SIZE} />}
              label={t("schedule")}
              value={slotDetail.scheduleLabel}
            />
            <MetaCell
              icon={<UsersTwo size={META_ICON_SIZE} />}
              label={t("capacity")}
              value={t("capacityValue", { count: slotDetail.capacity })}
            />
            <MetaCell
              icon={<User size={META_ICON_SIZE} />}
              label={t("coach")}
              value={slotDetail.coachName}
            />
            <MetaCell
              icon={<UsersThree size={META_ICON_SIZE} />}
              label={t("kind")}
              value={
                slotDetail.kind === "session" ? t("kindSession") : t("kindClass")
              }
            />
          </div>

          <section className={styles.section}>
            <Typography
              className={styles.sectionTitle}
              type="h4"
              weight="semibold"
            >
              {t("description")}
            </Typography>
            <Typography className={styles.bodyText} type="body-sm">
              {slotDetail.description}
            </Typography>
          </section>

          {slotDetail.upcoming.length > 0 ? (
            <section className={styles.section}>
              <Typography
                className={styles.sectionTitle}
                type="h4"
                weight="semibold"
              >
                {t("upcomingTitle")}
              </Typography>
              <div className={styles.upcomingList}>
                {slotDetail.upcoming.map((item) => (
                  <div className={styles.upcomingRow} key={item.id}>
                    <div className={styles.upcomingLeading}>
                      <span aria-hidden className={styles.upcomingIconWrap}>
                        <Calendar1 size={UPCOMING_ICON_SIZE} />
                      </span>
                      <div className={styles.upcomingMeta}>
                        <Typography
                          className={styles.upcomingDate}
                          type="body-sm"
                        >
                          {item.dateLabel}
                        </Typography>
                        <Typography
                          className={styles.upcomingTime}
                          type="body-xs"
                        >
                          {item.startTime} – {item.endTime}
                        </Typography>
                      </div>
                    </div>
                    <Typography
                      className={[
                        styles.upcomingStatus,
                        item.status === "cancelled"
                          ? styles.upcomingCancelled
                          : styles.upcomingScheduled,
                      ].join(" ")}
                      type="body-xs"
                    >
                      {item.status === "cancelled"
                        ? t("statusCancelled")
                        : t("statusScheduled")}
                    </Typography>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {slotDetail.classId ? (
            <Button
              className={styles.viewClass}
              onPress={() =>
                router.push(
                  `/discovery/clubs/${slotDetail.clubId}/classes/${slotDetail.classId}`,
                )
              }
              size="lg"
              variant="secondary"
            >
              {t("viewClass")}
            </Button>
          ) : null}
        </div>
      </div>

      <StickyBottomActions>
        <Button
          className={styles.footerButton}
          onPress={() =>
            runWithAuth(() => router.push(reserveHref), reserveHref)
          }
          size="lg"
          variant="primary"
        >
          {t("reserve")}
        </Button>
      </StickyBottomActions>
    </div>
  );
}
