"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Compass } from "@repo/icons/Compass";
import {
  ReservationCard,
  type ReservationCardStatusColor,
} from "@repo/ui/cards/ReservationCard";
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
import {
  canManageBooking,
  type BookingStatus,
} from "../../lib/bookings-data";
import { athleteBookingsScreenStyles as styles } from "./AthleteBookingsScreen.styles";
import type {
  AthleteBookingsScreenProps,
  BookingsFilterId,
} from "./AthleteBookingsScreen.types";

const FILTER_STATUSES: Record<BookingsFilterId, BookingStatus[]> = {
  upcoming: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED", "CHECKED_IN"],
  past: ["COMPLETED", "NO_SHOW", "REFUND_REQUESTED", "REFUNDED"],
  cancelled: ["CANCELLED", "REJECTED"],
};

const FILTER_IDS: BookingsFilterId[] = ["upcoming", "past", "cancelled"];

export function getBookingStatusColor(
  status: BookingStatus,
): ReservationCardStatusColor {
  switch (status) {
    case "CONFIRMED":
    case "CHECKED_IN":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "AWAITING_PAYMENT":
    case "REFUND_REQUESTED":
      return "warning";
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return "danger";
    case "REFUNDED":
      return "accent";
    default:
      return "default";
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
              selectedVariant="solid"
            >
              {t(`filters.${filterId}`)}
            </FilterChip>
          ))}
        </FilterChipBar>

        <Typography className={styles.meta} type="body-sm">
          {t("resultsCount", { count: visibleBookings.length })}
        </Typography>

        {visibleBookings.length > 0 ? (
          <div className={styles.list}>
            {visibleBookings.map((booking) => {
              const coachName = booking.coach?.name ?? booking.clubName;
              const manageable = canManageBooking(booking.status);

              return (
                <ReservationCard
                  key={booking.id}
                  aria-label={t("viewDetail")}
                  cancelLabel={t("cancel")}
                  coachName={coachName}
                  datetimeLabel={booking.datetimeLabel}
                  isVerified={booking.coach?.verification === "verified"}
                  onCancel={
                    manageable
                      ? () => router.push(`/athlete/bookings/${booking.id}`)
                      : undefined
                  }
                  onPress={() =>
                    router.push(`/athlete/bookings/${booking.id}`)
                  }
                  onReschedule={
                    manageable
                      ? () => router.push(`/athlete/bookings/${booking.id}`)
                      : undefined
                  }
                  rating={booking.coach?.rating}
                  ratingCount={booking.coach?.ratingCount}
                  rescheduleLabel={t("reschedule")}
                  sessionTitle={booking.title}
                  specialtyLabel={booking.coach?.specialtyLabel ?? booking.clubName}
                  statusColor={getBookingStatusColor(booking.status)}
                  statusLabel={t(`status.${booking.status}`)}
                  verifiedLabel={t("verified")}
                />
              );
            })}
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
