"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Clock } from "@repo/icons/Clock";
import { Compass } from "@repo/icons/Compass";
import { MapPin1 } from "@repo/icons/MapPin1";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "../../lib/bookings-data";
import { athleteBookingsScreenStyles as styles } from "./AthleteBookingsScreen.styles";
import type {
  AthleteBookingsScreenProps,
  BookingsFilterId,
} from "./AthleteBookingsScreen.types";

const ROW_ICON_SIZE = 16;

const FILTER_STATUSES: Record<BookingsFilterId, BookingStatus[]> = {
  upcoming: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED", "CHECKED_IN"],
  past: ["COMPLETED", "NO_SHOW", "REFUND_REQUESTED", "REFUNDED"],
  cancelled: ["CANCELLED", "REJECTED"],
};

const FILTER_IDS: BookingsFilterId[] = ["upcoming", "past", "cancelled"];

export function getBookingStatusColor(
  status: BookingStatus,
): "success" | "warning" | "danger" | undefined {
  switch (status) {
    case "CONFIRMED":
    case "CHECKED_IN":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "AWAITING_PAYMENT":
      return "warning";
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return "danger";
    default:
      return undefined;
  }
}

export function AthleteBookingsScreen({ bookings }: AthleteBookingsScreenProps) {
  const t = useTranslations("AthleteBookings");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<BookingsFilterId>("upcoming");

  const visibleBookings = bookings.filter((booking) =>
    FILTER_STATUSES[activeFilter].includes(booking.status),
  );

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
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {FILTER_IDS.map((filterId) => (
            <FilterChip
              key={filterId}
              onPress={() => setActiveFilter(filterId)}
              selected={activeFilter === filterId}
            >
              {t(`filters.${filterId}`)}
            </FilterChip>
          ))}
        </FilterChipBar>

        {visibleBookings.length > 0 ? (
          <div className={styles.list}>
            {visibleBookings.map((booking) => (
              <Button
                key={booking.id}
                className={styles.card}
                onPress={() => router.push(`/athlete/bookings/${booking.id}`)}
                variant="ghost"
              >
                <span className={styles.cardHeader}>
                  <span className={styles.cardTitles}>
                    <Typography
                      className={styles.cardTitle}
                      type="body"
                      weight="semibold"
                    >
                      {booking.title}
                    </Typography>
                    <Typography className={styles.cardClub} type="body-sm">
                      {booking.clubName}
                    </Typography>
                  </span>
                  <Chip color={getBookingStatusColor(booking.status)} size="sm">
                    <Chip.Label>{t(`status.${booking.status}`)}</Chip.Label>
                  </Chip>
                </span>

                <span className={styles.cardRows}>
                  <span className={styles.cardRow}>
                    <Calendar1
                      aria-hidden
                      className={styles.cardRowIcon}
                      size={ROW_ICON_SIZE}
                    />
                    <Typography className={styles.cardRowText} type="body-sm">
                      {booking.dateLabel}
                    </Typography>
                  </span>
                  <span className={styles.cardRow}>
                    <Clock
                      aria-hidden
                      className={styles.cardRowIcon}
                      size={ROW_ICON_SIZE}
                    />
                    <Typography className={styles.cardRowText} type="body-sm">
                      {booking.timeLabel}
                    </Typography>
                  </span>
                  <span className={styles.cardRow}>
                    <MapPin1
                      aria-hidden
                      className={styles.cardRowIcon}
                      size={ROW_ICON_SIZE}
                    />
                    <Typography className={styles.cardRowText} type="body-sm">
                      {booking.locationLabel}
                    </Typography>
                  </span>
                </span>

                <span className={styles.cardFooter}>
                  <Typography
                    className={styles.cardPrice}
                    type="body"
                    weight="semibold"
                  >
                    {booking.priceLabel}
                  </Typography>
                  <Typography className={styles.cardClub} type="body-sm">
                    {t("viewDetail")}
                  </Typography>
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <EmptyState
            description={t(`empty.${activeFilter}`)}
            illustration={
              activeFilter === "upcoming"
                ? EMPTY_STATE_ILLUSTRATIONS.session
                : EMPTY_STATE_ILLUSTRATIONS.calendar
            }
            illustrationAlt=""
            layout="media"
            primaryAction={
              activeFilter === "upcoming"
                ? {
                    label: t("exploreCoaches"),
                    endContent: <Compass size={18} />,
                    onPress: () => router.push("/discovery/coaches"),
                  }
                : undefined
            }
            title={t("emptyTitle")}
          />
        )}
      </div>
    </AppLayout>
  );
}
